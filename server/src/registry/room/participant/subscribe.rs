use crate::message::server::ServerMessage;
use log::error;
use mediasoup::audio_level_observer::AudioLevelObserverVolume;
use mediasoup::prelude::{ActiveSpeakerObserverDominantSpeaker, MediaKind, Producer, ProducerId};
use server::types::Id;
use tokio::sync::mpsc::UnboundedSender;
use crate::message::internal::InternalMessage;

use super::super::subscription::Subscribe;
use super::connection::Connection;

pub enum Event {
    OnProducerAdd,
    OnProducerRemove,
    ToggleMedia,
    OnActionBroadcast,
    OnActiveSpeakerChange,
    OnNoActiveSpeaker,
    OnLastActiveSpeaker
}

pub trait SubscribeEvent {
    fn subscribe_events(
        &mut self,
        server_message_sender: UnboundedSender<ServerMessage>,
        internal_message_sender: UnboundedSender<InternalMessage>
    );
    fn subscribe_event(
        &mut self,
        event: Event,
        server_message_sender: UnboundedSender<ServerMessage>,
        internal_message_sender: UnboundedSender<InternalMessage>
    );
}

impl SubscribeEvent for Connection {
    fn subscribe_events(
        &mut self,
        server_message_sender: UnboundedSender<ServerMessage>,
        internal_message_sender: UnboundedSender<InternalMessage>
    ) {
        // Listen for new producers added to the room
        self.subscribe_event(Event::OnProducerAdd, server_message_sender.clone(), internal_message_sender.clone());

        // Listen for producers removed from the the room
        self.subscribe_event(Event::OnProducerRemove, server_message_sender.clone(), internal_message_sender.clone());

        // Listen for toggle media
        self.subscribe_event(Event::ToggleMedia, server_message_sender.clone(), internal_message_sender.clone());

        // Listen for action being broadcast
        self.subscribe_event(Event::OnActionBroadcast, server_message_sender.clone(), internal_message_sender.clone());

        // Listen for changes in the active speaker
        self.subscribe_event(Event::OnActiveSpeakerChange, server_message_sender.clone(), internal_message_sender.clone());

        // Listen if there is no more active speakers
        self.subscribe_event(Event::OnNoActiveSpeaker, server_message_sender.clone(), internal_message_sender.clone());

        // Listen if the last active speaker started speaking again
        self.subscribe_event(Event::OnLastActiveSpeaker, server_message_sender.clone(), internal_message_sender.clone())
    }

    fn subscribe_event(
        &mut self,
        event: Event,
        server_message_sender: UnboundedSender<ServerMessage>,
        internal_message_sender: UnboundedSender<InternalMessage>
    ) {
        let handler_id = match event {
            Event::OnProducerAdd => {
                self.room.on_producer_add(handle_on_producer_add::<
                    fn(&Id, &String, &Producer, &bool, &bool),
                >(self.id.clone(), server_message_sender))
            }
            Event::OnProducerRemove => self.room.on_producer_remove(handle_on_producer_remove::<
                fn(&Id, &ProducerId),
            >(
                self.id.clone(),
                server_message_sender,
            )),
            Event::ToggleMedia => self.room.on_toggle_media(handle_on_toggle_media::<
                fn(&Id, &MediaKind, &bool),
            >(
                self.id.clone(),
                server_message_sender,
            )),
            Event::OnActionBroadcast => {
                self.room
                    .on_action_broadcast(handle_on_action_broadcast::<fn(&String, &Id)>(
                        server_message_sender,
                    ))
            }
            Event::OnActiveSpeakerChange => {
                self.room
                    .active_speaker_observer()
                    .on_dominant_speaker(
                        handle_on_active_speaker_change::<fn(&ActiveSpeakerObserverDominantSpeaker)>(
                            internal_message_sender
                        ))
            }
            Event::OnNoActiveSpeaker => {
                self.room
                    .audio_level_observer()
                    .on_silence(handle_on_no_active_speaker::<fn()>(
                        internal_message_sender
                    ))
            }
            Event::OnLastActiveSpeaker => {
                self.room
                    .audio_level_observer()
                    .on_volumes(handle_on_last_active_speaker::<fn(&[AudioLevelObserverVolume])>(
                            internal_message_sender
                    ))
            }
        };
        self.attached_handlers.push(handler_id);
    }
}

fn handle_on_producer_add<F: Fn(&Id, &String, &Producer, &bool, &bool) + Send + Sync + 'static>(
    own_participant_id: Id,
    tx: UnboundedSender<ServerMessage>,
) -> impl Fn(&Id, &String, &Producer, &bool, &bool) + Send + Sync {
    move |participant_id: &Id,
          display_name: &String,
          producer: &Producer,
          is_share_screen: &bool,
          is_enabled: &bool
    | {
        if &own_participant_id == participant_id {
            return;
        }
        if let Err(e) = tx.send(ServerMessage::ProducerAdded {
            is_share_screen: *is_share_screen,
            is_enabled: *is_enabled,
            participant_id: participant_id.clone(),
            display_name: display_name.clone(),
            producer_id: producer.id(),
        }) {
            error!("Failed to send server message (new producer): {}", e);
        }
    }
}

fn handle_on_producer_remove<F: Fn(&Id, &ProducerId) + Send + Sync + 'static>(
    own_participant_id: Id,
    tx: UnboundedSender<ServerMessage>,
) -> impl Fn(&Id, &ProducerId) + Send + Sync {
    move |participant_id, producer_id| {
        if &own_participant_id == participant_id {
            return;
        }
        if let Err(e) = tx.send(ServerMessage::ProducerRemoved {
            participant_id: participant_id.clone(),
            producer_id: *producer_id,
        }) {
            error!("Failed to send server message (producer removed): {}", e);
        }
    }
}

fn handle_on_toggle_media<F: Fn(&Id, &MediaKind, &bool) + Send + Sync + 'static>(
    own_participant_id: Id,
    tx: UnboundedSender<ServerMessage>,
) -> impl Fn(&Id, &MediaKind, &bool) + Send + Sync {
    move |participant_id, kind, is_play| {
        if &own_participant_id == participant_id {
            return;
        }
        if let Err(e) = tx.send(ServerMessage::ToggleMedia {
            participant_id: participant_id.clone(),
            kind: *kind,
            is_play: *is_play,
        }) {
            error!("Failed to send server message (toggle disable): {}", e);
        }
    }
}

fn handle_on_action_broadcast<F: Fn(&String, &Id) + Send + Sync + 'static>(
    tx: UnboundedSender<ServerMessage>,
) -> impl Fn(&String, &Id) + Send + Sync {
    move |kind, participant_id| {
        if let Err(e) = tx.send(ServerMessage::BroadcastAction {
            kind: kind.clone(),
            from: participant_id.clone(),
        }) {
            error!("Failed to send server message (broadcast action): {}", e);
        }
    }
}

fn handle_on_active_speaker_change<F: Fn(&ActiveSpeakerObserverDominantSpeaker) + Send + Sync + 'static>(
    incoming_tx: UnboundedSender<InternalMessage>
) -> impl Fn(&ActiveSpeakerObserverDominantSpeaker) + Send + Sync {
    move |active_speaker_observer_dominant_speaker| {
        let producer_id = active_speaker_observer_dominant_speaker.producer.id();
        broadcast_active_speaker(Some(producer_id), incoming_tx.clone());
    }
}

fn handle_on_no_active_speaker<F: Fn() + Send + Sync + 'static>(
    incoming_tx: UnboundedSender<InternalMessage>
) -> impl Fn() + Send + Sync {
    move || {
        broadcast_active_speaker(None, incoming_tx.clone())
    }
}

fn handle_on_last_active_speaker<F: Fn(&[AudioLevelObserverVolume]) + Send + Sync + 'static>(
    incoming_tx: UnboundedSender<InternalMessage>
) -> impl Fn(&[AudioLevelObserverVolume]) + Send + Sync {
    move |audio_level_observer_volume| {
        let active_producer = audio_level_observer_volume.first();
        if let None = active_producer {
            return
        }

        let producer_id = active_producer.unwrap().producer.id();
        broadcast_active_speaker(Some(producer_id), incoming_tx.clone());
    }
}

fn broadcast_active_speaker(
    producer_id: Option<ProducerId>,
    incoming_tx: UnboundedSender<InternalMessage>,
) {
    if let Err(e) = incoming_tx.send(InternalMessage::ActiveSpeaker(producer_id))
    {
        error!("Failed to send internal message (active speaker): {}", e)
    };
}

