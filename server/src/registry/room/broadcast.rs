use axum::async_trait;
use log::error;
use mediasoup::prelude::{MediaKind, Producer};
use mediasoup::worker::RequestError;
use server::types::Id;
use std::ops::Deref;

#[async_trait]
pub trait Broadcast {
    fn add_producer(
        &self,
        participant_id: Id,
        display_name: String,
        producer: Producer,
        is_share_screen: bool,
    );
    async fn toggle_media(&self, kind: MediaKind, is_play: bool, participant_id: &Id);
    fn remove_participant(&self, participant_id: &Id);
    fn broadcast_action(&self, kind: String, participant_id: &Id);
}

#[async_trait]
impl Broadcast for super::Room {
    /// Add producer to the room, this will trigger notifications to other participants that
    /// will be able to consume it
    fn add_producer(
        &self,
        participant_id: Id,
        display_name: String,
        producer: Producer,
        is_share_screen: bool,
    ) {
        if is_share_screen {
            let share_screen_participant =
                self.inner.share_screen_participant.lock().deref().clone();
            if let Some(participant_id) = share_screen_participant {
                self.remove_participant(&participant_id)
            }
            self.inner
                .share_screen_participant
                .lock()
                .replace(participant_id.clone());
        }

        self.inner
            .clients
            .lock()
            .entry(participant_id.clone())
            .or_default()
            .producers
            .push(producer.clone());

        self.inner
            .clients
            .lock()
            .entry(participant_id.clone())
            .or_default()
            .display_name = display_name.clone();

        self.inner
            .clients
            .lock()
            .entry(participant_id.clone())
            .or_default()
            .is_share_screen = is_share_screen;

        self.inner.handlers.producer_add.call_simple(
            &participant_id,
            &display_name,
            &producer,
            &is_share_screen,
        );
    }

    /// Toggle media
    async fn toggle_media(&self, kind: MediaKind, is_play: bool, participant_id: &Id) {
        let client = self.inner.clients.lock();
        let participant = client.get(participant_id);

        let producer = if let Some(participant) = participant {
            participant
                .producers
                .iter()
                .find(|producer| producer.kind() == kind)
        } else {
            None
        };

        let result = if let Some(producer) = producer {
            let fut = async {
                if is_play {
                    producer.resume().await
                } else {
                    producer.pause().await
                }
            };
            futures::executor::block_on(fut)
        } else {
            Err(RequestError::NoData)
        };

        if let Err(error) = result {
            error!("Toggle Media Error: {:#?}", error);
        } else {
            self.inner
                .handlers
                .toggle_media
                .call_simple(participant_id, &kind, &is_play);
        }
    }

    /// Remove participant and all of its associated producers
    fn remove_participant(&self, participant_id: &Id) {
        let room_participant = self.inner.clients.lock().remove(participant_id);

        let share_screen_participant = self.inner.share_screen_participant.lock().deref().clone();

        if let Some(share_screen_participant) = share_screen_participant {
            if share_screen_participant.clone() == participant_id.clone() {
                self.inner.share_screen_participant.lock().take();
            }
        }

        for producer in room_participant.unwrap_or_default().producers {
            let producer_id = &producer.id();
            self.inner
                .handlers
                .producer_remove
                .call_simple(participant_id, producer_id);
        }
    }

    fn broadcast_action(&self, kind: String, participant_id: &Id) {
        self.inner
            .handlers
            .broadcast_action
            .call_simple(&kind, participant_id)
    }
}
