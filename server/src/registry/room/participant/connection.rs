use std::collections::HashMap;

use axum::extract::ws::{Message, WebSocket};
use event_listener_primitives::HandlerId;
use log::{debug, error, info};
use mediasoup::prelude::*;
use tokio::sync::mpsc::unbounded_channel;

use super::super::broadcast::Broadcast;
use crate::message::client::ClientMessage;
use crate::message::internal::InternalMessage;
use crate::message::server::ServerMessage;
use server::config::participant_transport_options;
use server::types::{Id, TransportOptions};

use super::super::Room;
use super::interpret::InterpretClientMessage;
use super::subscribe::SubscribeEvent;

/// Consumer/producer transports pair for the client
pub struct Transports {
    pub consumer: WebRtcTransport,
    pub producer: WebRtcTransport,
}

pub struct Connection {
    pub id: Id,
    // Display name used by the webapp
    pub display_name: String,
    /// flag to determine if this is a share screen participant
    pub is_share_screen: bool,
    /// RTP capabilities received from the client
    pub client_rtp_capabilities: Option<RtpCapabilities>,
    /// Consumers associated with this client, preventing them from being destroyed
    pub consumers: HashMap<ConsumerId, Consumer>,
    /// Producers associated with this client, preventing them from being destroyed
    producers: Vec<Producer>,
    /// Consumer and producer transports associated with this client
    pub transports: Transports,
    /// Room to which the client belongs
    pub room: Room,
    /// Event handlers that were attached and need to be removed when participant connection is
    /// destroyed
    pub attached_handlers: Vec<HandlerId>,

    pub is_video_enabled: bool,
    pub is_sound_enabled: bool,

    pub last_active_speaker: Option<ProducerId>
}

impl Drop for Connection {
    fn drop(&mut self) {
        self.room.remove_participant(&self.id);
    }
}

impl Connection {
    /// Create a new instance representing WebSocket connection
    pub async fn new(
        room: Room,
        display_name: String,
        is_share_screen: bool,
    ) -> Result<Self, String> {
        let producer_transport = room
            .router()
            .create_webrtc_transport(participant_transport_options())
            .await
            .map_err(|error| format!("Failed to create producer transport: {error}"))?;

        let consumer_transport = room
            .router()
            .create_webrtc_transport(participant_transport_options())
            .await
            .map_err(|error| format!("Failed to create consumer transport: {error}"))?;

        Ok(Self {
            id: Id::new(),
            display_name,
            is_share_screen,
            client_rtp_capabilities: None,
            consumers: HashMap::new(),
            producers: vec![],
            transports: Transports {
                consumer: consumer_transport,
                producer: producer_transport,
            },
            room,
            attached_handlers: Vec::new(),
            is_sound_enabled: true,
            is_video_enabled: true,
            last_active_speaker: None
        })
    }

    pub async fn run(mut self, mut socket: WebSocket) -> anyhow::Result<()> {
        let (server_message_sender, mut server_message_receiver) =
            unbounded_channel::<ServerMessage>();
        let (internal_message_sender, mut internal_message_receiver) =
            unbounded_channel::<InternalMessage>();

        // Send init message to establish WebRTC transport connection client-side
        let server_init_message = ServerMessage::Init {
            participant_id: self.id.clone(),
            display_name: self.display_name.clone(),
            room_id: self.room.id(),
            is_share_screen: self.is_share_screen,
            consumer_transport_options: TransportOptions {
                id: self.transports.consumer.id(),
                dtls_parameters: self.transports.consumer.dtls_parameters(),
                ice_candidates: self.transports.consumer.ice_candidates().clone(),
                ice_parameters: self.transports.consumer.ice_parameters().clone(),
            },
            producer_transport_options: TransportOptions {
                id: self.transports.producer.id(),
                dtls_parameters: self.transports.producer.dtls_parameters(),
                ice_candidates: self.transports.producer.ice_candidates().clone(),
                ice_parameters: self.transports.producer.ice_parameters().clone(),
            },
            router_rtp_capabilities: self.room.router().rtp_capabilities().clone(),
        };
        socket
            .send(Message::Text(serde_json::to_string(&server_init_message)?))
            .await?;

        self.subscribe_events(server_message_sender.clone(), internal_message_sender.clone());

        // Notify client about any producers that already exist in the room
        let all_producers = self.room.get_all_producers();
        for (participant_id, display_name, producer_id, is_share_screen, is_enabled) in all_producers {
            if let Err(e) = server_message_sender.send(ServerMessage::ProducerAdded {
                is_share_screen,
                is_enabled,
                participant_id,
                display_name,
                producer_id,
            }) {
                error!(
                    "Failed to send server message (to notify client producers): {}",
                    e
                );
            }
        }

        // Websocket state machine
        loop {
            tokio::select! {
                internal_message_recv = internal_message_receiver.recv() => {
                    if let Some(message) = internal_message_recv {
                        match message {
                            InternalMessage::Stop => {
                                break;
                            }
                            InternalMessage::SaveProducer(producer) => {
                                // Retain producer to prevent it from being destroyed
                                self.producers.push(producer);
                            }
                            InternalMessage::SaveConsumer(consumer) => {
                                self.consumers.insert(consumer.id(), consumer);
                            }
                            InternalMessage::ActiveSpeaker(producer_id) => {
                                if producer_id != self.last_active_speaker {
                                    let mut participant_id = None;
                                    if let Some(producer_id) = producer_id {
                                        // if there was an old active speaker, remove it
                                        // so we only listen to the current active speaker
                                        if let Some(active_speaker) = self.last_active_speaker {
                                            if let Err(e) = self.room.audio_level_observer().remove_producer(active_speaker).await {
                                                error!("remove producer error: {}", e)
                                            }
                                        }

                                        // so that we can listen if the current active speaker goes silent and makes noise again
                                        if let Err(e) = self.room
                                            .audio_level_observer()
                                            .add_producer(
                                                RtpObserverAddProducerOptions::new(producer_id)
                                            ).await {
                                            error!("add producer error: {}", e)
                                        }

                                        participant_id = self.room.get_participant_id_from_producer_id(producer_id);
                                    }

                                    // send a message to everyone that there is a new active speaker
                                    if let Err(e) = server_message_sender.clone().send(ServerMessage::ActiveSpeaker {
                                            participant_id
                                    }) {
                                            error!("failed to send active speaker: {}", e)
                                    }

                                    // change to current active speaker
                                    self.last_active_speaker = producer_id;
                                }
                            }
                        }
                    }
                }
                server_message_recv = server_message_receiver.recv() => {
                    if let Some(message) = server_message_recv {
                        if let Err(e) = socket.send(Message::Text(serde_json::to_string(&message)?)).await {
                            error!("send server message error: {}", e);
                            internal_message_sender.send(InternalMessage::Stop).unwrap_or_default();
                        }
                    }
                }
                websocket_recv = socket.recv() => {
                    if let Some(result) = websocket_recv {
                        let message = result?;
                        match message {
                            Message::Text(text) => {
                                let client_message: ClientMessage =
                                    serde_json::from_str(&text)?;

                                self.interpret_client_message(
                                    client_message,
                                    internal_message_sender.clone(),
                                    server_message_sender.clone()
                                ).await;
                            }
                            Message::Binary(bytes) => {
                                info!("Unexpected binary message ({} bytes): {:?}", bytes.len(), bytes);
                            }
                            Message::Ping(bytes) => {
                                socket.send(Message::Pong(bytes)).await?;
                            }
                            Message::Pong(_) => {}
                            Message::Close(close) => {
                                if let Some(close_frame) = close {
                                    debug!(
                                        "Received close frame: ({}, {})",
                                        close_frame.code,
                                        close_frame.reason
                                    );
                                }
                                socket.close().await?;
                                return Ok(());
                            }
                        }
                    }
                }
            }
        }

        Ok(())
    }
}
