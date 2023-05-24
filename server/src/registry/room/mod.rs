use std::panic::{catch_unwind, AssertUnwindSafe};
use std::sync::Arc;
use std::time::Duration;

use handler::Handler;
use inner::Inner;
use log::error;
use mediasoup::active_speaker_observer::{ActiveSpeakerObserver, ActiveSpeakerObserverOptions};
use mediasoup::prelude::{ProducerId, Router, RouterOptions, WorkerManager};
use parking_lot::Mutex;
use participant::Participant;
use tokio::sync::RwLock;
use tokio::time::sleep;
use weak::WeakRoom;
use y_sync::awareness::Awareness;
use y_sync::sync::{Message, MessageReader, SyncMessage};
use yrs::updates::decoder::{Decode, DecoderV1};
use yrs::updates::encoder::Encode;
use yrs::{Doc, ReadTxn, Transact, Update};

use server::config::{media_codecs, worker_settings};
use server::types::Id;

mod broadcast;
pub mod collaborator;
mod handler;
pub mod id;
mod inner;
pub mod participant;
pub mod subscription;
pub mod weak;

#[derive(Debug, Clone)]
pub struct Room {
    inner: Arc<Inner>,
}

impl Room {
    /// Create new `Room` with random `RoomId`
    pub async fn new(worker_manager: &WorkerManager) -> Result<Self, String> {
        Self::new_with_id(worker_manager, id::RoomId::new()).await
    }

    /// Create new `Room` with a specific `RoomId`
    pub async fn new_with_id(
        worker_manager: &WorkerManager,
        id: id::RoomId,
    ) -> Result<Room, String> {
        let worker = worker_manager
            .create_worker(worker_settings())
            .await
            .map_err(|error| format!("Failed to create worker: {error}"))?;

        let router = worker
            .create_router(RouterOptions::new(media_codecs()))
            .await
            .map_err(|error| format!("Failed to create router: {error}"))?;

        let doc = Doc::new();
        let awareness = Arc::new(RwLock::new(Awareness::new(doc.clone())));

        let active_speaker_observer = router
            .create_active_speaker_observer(ActiveSpeakerObserverOptions::default())
            .await
            .map_err(|error| format!("Failed to create active speaker observer: {error}"))?;

        Ok(Self {
            inner: Arc::new(Inner {
                id,
                active_speaker_observer,
                router,
                handlers: Handler::default(),
                clients: Mutex::default(),
                doc,
                awareness,
                share_screen_participant: Mutex::new(None),
            }),
        })
    }

    /// ID of the room
    pub fn id(&self) -> id::RoomId {
        self.inner.id.clone()
    }

    /// Get router associated with this room
    pub fn router(&self) -> &Router {
        &self.inner.router
    }

    /// Get active_speaker_observer associated with this room
    pub fn active_speaker_observer(&self) -> &ActiveSpeakerObserver { &self.inner.active_speaker_observer }

    /// Get all producers of all participants, useful when new participant connects and needs to
    /// consume tracks of everyone who is already in the room
    pub fn get_all_producers(&self) -> Vec<(Id, String, ProducerId, bool, bool)> {
        self.inner
            .clients
            .lock()
            .iter()
            .flat_map(|(participant_id, room_participant)| {
                let participant_id = participant_id.clone();
                let display_name = room_participant.display_name.clone();
                room_participant.producers.iter().map(move |producer| {
                    (
                        participant_id.clone(),
                        display_name.clone(),
                        producer.id(),
                        room_participant.is_share_screen,
                        !producer.paused()
                    )
                })
            })
            .collect()
    }
    
    /// Get participant_id from producer_id
    pub fn get_participant_id_from_producer_id(&self, producer_id: ProducerId) -> Option<Id> {
        match self.inner
            .clients
            .lock()
            .iter()
            .find(|(_, room_participant)| {
                return room_participant.producers.iter().find(|producer| {
                    producer_id == producer.id()
                }).is_some()
            }) {
            Some((participant_id, _)) => Some(participant_id.clone()),
            None => None
        }
    }

    /// Get `WeakRoom` that can later be upgraded to `Room`, but will not prevent room from
    /// being destroyed
    pub fn downgrade(&self) -> WeakRoom {
        WeakRoom {
            inner: Arc::downgrade(&self.inner),
        }
    }

    pub async fn sync_doc(&mut self, binary: &[u8]) -> Vec<Vec<u8>> {
        // Differences/modifications as binary is sent from the client and synchronized here
        let mut decoder = DecoderV1::from(binary);
        let mut result = vec![];

        let (awareness_msg, content_msg): (Vec<_>, Vec<_>) = MessageReader::new(&mut decoder)
            .flatten()
            .partition(|msg| matches!(msg, Message::Awareness(_) | Message::AwarenessQuery));

        if !awareness_msg.is_empty() {
            let mut awareness = self.inner.awareness.write().await;
            if let Err(e) = catch_unwind(AssertUnwindSafe(|| {
                for msg in awareness_msg {
                    match msg {
                        Message::AwarenessQuery => {
                            if let Ok(update) = awareness.update() {
                                result.push(Message::Awareness(update).encode_v1());
                            }
                        }
                        Message::Awareness(update) => {
                            if let Err(e) = awareness.apply_update(update) {
                                error!("Room: failed to apply awareness: {:?}", e);
                            }
                        }
                        _ => {}
                    }
                }
            })) {
                error!("Room: failed to apply awareness update: {:?}", e);
            }
        }
        if !content_msg.is_empty() {
            let doc = &self.inner.doc;
            if let Err(e) = catch_unwind(AssertUnwindSafe(|| {
                let mut retry = 30;
                let mut trx = loop {
                    if let Ok(trx) = doc.try_transact_mut() {
                        break trx;
                    } else if retry > 0 {
                        retry -= 1;
                        let _ = sleep(Duration::from_micros(10));
                    } else {
                        return;
                    }
                };
                for msg in content_msg {
                    if let Some(msg) = {
                        match msg {
                            Message::Sync(msg) => match msg {
                                SyncMessage::SyncStep1(sv) => {
                                    let update = trx.encode_state_as_update_v1(&sv);
                                    Some(Message::Sync(SyncMessage::SyncStep2(update)))
                                }
                                SyncMessage::SyncStep2(update) => {
                                    if let Ok(update) = Update::decode_v1(&update) {
                                        trx.apply_update(update);
                                    }
                                    None
                                }
                                SyncMessage::Update(update) => {
                                    if let Ok(update) = Update::decode_v1(&update) {
                                        trx.apply_update(update);
                                        trx.commit();
                                        let update = trx.encode_update_v1();
                                        Some(Message::Sync(SyncMessage::Update(update)))
                                    } else {
                                        None
                                    }
                                }
                            },
                            _ => None,
                        }
                    } {
                        result.push(msg.encode_v1());
                    }
                }
            })) {
                error!("Room: failed to apply update: {:?}", e);
            }
        }
        result
    }
}
