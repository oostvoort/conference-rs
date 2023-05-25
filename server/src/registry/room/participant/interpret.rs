use crate::message::client::ClientMessage;
use crate::message::internal::InternalMessage;
use crate::message::server::ServerMessage;
use axum::async_trait;
use log::{debug, error};
use mediasoup::consumer::ConsumerOptions;
use mediasoup::data_structures::DtlsParameters;
use mediasoup::prelude::{
    ConsumerId, MediaKind, ProducerId, ProducerOptions, RtpParameters,
    WebRtcTransportRemoteParameters,
};
use mediasoup::transport::Transport;
use tokio::sync::mpsc::UnboundedSender;

use super::super::broadcast::Broadcast;
use super::connection::Connection;

#[async_trait]
pub trait InterpretClientMessage {
    async fn interpret_client_message(
        &mut self,
        client_message: ClientMessage,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    );
}

#[async_trait]
impl InterpretClientMessage for Connection {
    async fn interpret_client_message(
        &mut self,
        client_message: ClientMessage,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    ) {
        match client_message {
            ClientMessage::BroadcastAction { kind } => {
                self.room.broadcast_action(kind, &self.id);
            }
            ClientMessage::ToggleMedia { kind } => {
                self.toggle_media(kind).await;
            }
            ClientMessage::Init { rtp_capabilities } => {
                self.client_rtp_capabilities.replace(rtp_capabilities);
            }
            ClientMessage::ProducerUpdate { rtp_capabilities } => {
                self.client_rtp_capabilities.replace(rtp_capabilities);
            }
            ClientMessage::ConnectProducerTransport { dtls_parameters } => self
                .connect_producer_transport(
                    dtls_parameters,
                    internal_message_sender,
                    server_message_sender,
                ),
            ClientMessage::Produce {
                kind,
                rtp_parameters,
            } => self.produce(
                kind,
                rtp_parameters,
                internal_message_sender,
                server_message_sender,
            ),
            ClientMessage::ConnectConsumerTransport { dtls_parameters } => self
                .connect_consumer_transport(
                    dtls_parameters,
                    internal_message_sender,
                    server_message_sender,
                ),
            ClientMessage::Consume { producer_id } => {
                self.consume(producer_id, internal_message_sender, server_message_sender)
            }
            ClientMessage::ConsumerResume { id } => self.consumer_resume(id),
            ClientMessage::ConsumerUpdate {} => self.consumer_update(server_message_sender),
        }
    }
}

#[async_trait]
trait ToggleMedia {
    async fn toggle_media(&mut self, kind: MediaKind);
}

#[async_trait]
impl ToggleMedia for Connection {
    async fn toggle_media(&mut self, kind: MediaKind) {
        let is_play = match kind {
            MediaKind::Audio => {
                self.is_sound_enabled = !self.is_sound_enabled;
                self.is_sound_enabled
            }
            MediaKind::Video => {
                self.is_video_enabled = !self.is_video_enabled;
                self.is_video_enabled
            }
        };
        self.room.toggle_media(kind, is_play, &self.id).await;
    }
}

trait ConnectProducerTransport {
    fn connect_producer_transport(
        &mut self,
        dtls_parameters: DtlsParameters,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    );
}

impl ConnectProducerTransport for Connection {
    fn connect_producer_transport(
        &mut self,
        dtls_parameters: DtlsParameters,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    ) {
        let participant_id = self.id.clone();
        let transport = self.transports.producer.clone();
        // Establish connection for producer transport using DTLS parameters received
        // from the client, but doing so in a background task since this handler is
        // synchronous
        let internal_sender = internal_message_sender.clone();
        let server_sender = server_message_sender.clone();
        tokio::spawn(async move {
            match transport
                .connect(WebRtcTransportRemoteParameters { dtls_parameters })
                .await
            {
                Ok(_) => {
                    if let Err(e) = server_sender.send(ServerMessage::ConnectedProducerTransport) {
                        error!("send message error: {}", e);
                        internal_sender
                            .send(InternalMessage::Stop)
                            .unwrap_or_default();
                    }
                    debug!(
                        "[participant_id {}] Producer transport connected",
                        participant_id,
                    );
                }
                Err(error) => {
                    error!("Failed to connect producer transport: {}", error);
                    internal_sender
                        .send(InternalMessage::Stop)
                        .unwrap_or_default();
                }
            }
        });
    }
}

trait Produce {
    fn produce(
        &self,
        kind: MediaKind,
        rtp_parameters: RtpParameters,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    );
}

impl Produce for Connection {
    fn produce(
        &self,
        kind: MediaKind,
        rtp_parameters: RtpParameters,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    ) {
        debug!("Received client message 'Produce'.");
        let participant_id = self.id.clone();

        let transport = self.transports.producer.clone();
        let room = self.room.clone();
        let display_name = self.display_name.clone();
        // Use producer transport to create a new producer on the server with given RTP
        // parameters
        let server_sender = server_message_sender.clone();
        let internal_sender = internal_message_sender.clone();

        let is_share_screen = self.is_share_screen;

        std::thread::spawn(move || {
            futures::executor::block_on(async move {
                debug!("Trying to produce");
                match transport
                    .produce(ProducerOptions::new(kind, rtp_parameters))
                    .await
                {
                    Ok(producer) => {
                        let id = producer.id();
                        if let Err(e) = server_sender.send(ServerMessage::Produced { id }) {
                            error!("send message error: {}", e);
                            internal_sender
                                .send(InternalMessage::Stop)
                                .unwrap_or_default();
                            return;
                        }
                        // Add producer to the room so that others can consume it
                        room.add_producer(
                            participant_id.clone(),
                            display_name,
                            producer.clone(),
                            is_share_screen,
                        ).await;
                        // Producer is stored in a hashmap since if we don't do it, it will
                        // get destroyed as soon as its instance goes out out scope
                        internal_sender
                            .send(InternalMessage::SaveProducer(producer))
                            .unwrap_or_default();
                        debug!(
                            "[participant_id {}] {:?} producer created: {}",
                            &participant_id, kind, id,
                        );
                    }
                    Err(error) => {
                        debug!(
                            "[participant_id {}] Failed to create {:?} producer: {}",
                            participant_id, kind, error
                        );
                        internal_sender
                            .send(InternalMessage::Stop)
                            .unwrap_or_default();
                    }
                }
            });
        });
    }
}

trait ConnectConsumerTransport {
    fn connect_consumer_transport(
        &self,
        dtls_parameters: DtlsParameters,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    );
}

impl ConnectConsumerTransport for Connection {
    fn connect_consumer_transport(
        &self,
        dtls_parameters: DtlsParameters,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    ) {
        let participant_id = self.id.clone();
        let transport = self.transports.consumer.clone();
        // The same as producer transport, but for consumer transport

        let server_sender = server_message_sender.clone();
        let internal_sender = internal_message_sender.clone();
        tokio::spawn(async move {
            match transport
                .connect(WebRtcTransportRemoteParameters { dtls_parameters })
                .await
            {
                Ok(_) => {
                    if let Err(e) = server_sender.send(ServerMessage::ConnectedConsumerTransport) {
                        error!("send message error: {}", e);
                        internal_sender
                            .send(InternalMessage::Stop)
                            .unwrap_or_default();
                        return;
                    }
                    debug!(
                        "[participant_id {}] Consumer transport connected",
                        participant_id,
                    );
                }
                Err(error) => {
                    error!(
                        "[participant_id {}] Failed to connect consumer transport: {}",
                        participant_id, error,
                    );
                    internal_sender
                        .send(InternalMessage::Stop)
                        .unwrap_or_default();
                }
            }
        });
    }
}

trait Consume {
    fn consume(
        &self,
        producer_id: ProducerId,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    );
}

impl Consume for Connection {
    fn consume(
        &self,
        producer_id: ProducerId,
        internal_message_sender: UnboundedSender<InternalMessage>,
        server_message_sender: UnboundedSender<ServerMessage>,
    ) {
        let participant_id = self.id.clone();
        let transport = self.transports.consumer.clone();
        let rtp_capabilities = match self.client_rtp_capabilities.clone() {
            Some(rtp_capabilities) => rtp_capabilities,
            None => {
                debug!(
                    "[participant_id {}] Client should send RTP capabilities before \
                                                    consuming",
                    participant_id,
                );
                return;
            }
        };
        // Create consumer for given producer ID, while first making sure that RTP
        // capabilities were sent by the client prior to that
        let server_sender = server_message_sender.clone();
        let internal_sender = internal_message_sender.clone();
        std::thread::spawn(move || {
            futures::executor::block_on(async move {
                let mut options = ConsumerOptions::new(producer_id, rtp_capabilities);
                options.paused = true;

                match transport.consume(options).await {
                    Ok(consumer) => {
                        let id = consumer.id();
                        let kind = consumer.kind();
                        let rtp_parameters = consumer.rtp_parameters().clone();
                        if let Err(e) = server_sender.send(ServerMessage::Consumed {
                            id,
                            producer_id,
                            kind,
                            rtp_parameters,
                        }) {
                            error!("send message error: {}", e);
                            internal_sender
                                .send(InternalMessage::Stop)
                                .unwrap_or_default();
                            return;
                        }
                        // Consumer is stored in a hashmap since if we don't do it, it will
                        // get destroyed as soon as its instance goes out out scope
                        internal_sender
                            .send(InternalMessage::SaveConsumer(consumer))
                            .unwrap_or_default();
                        debug!(
                            "[participant_id {}] {:?} consumer created: {}",
                            participant_id, kind, id,
                        );
                    }
                    Err(error) => {
                        debug!(
                            "[participant_id {}] Failed to create consumer: {}",
                            participant_id, error,
                        );
                        internal_sender
                            .send(InternalMessage::Stop)
                            .unwrap_or_default();
                    }
                }
            })
        });
    }
}

trait ConsumerResume {
    fn consumer_resume(&self, id: ConsumerId);
}

impl ConsumerResume for Connection {
    fn consumer_resume(&self, id: ConsumerId) {
        if let Some(consumer) = self.consumers.get(&id).cloned() {
            let participant_id = self.id.clone();
            tokio::spawn(async move {
                match consumer.resume().await {
                    Ok(_) => {
                        debug!(
                            "[participant_id {}] Successfully resumed {:?} consumer {}",
                            participant_id,
                            consumer.kind(),
                            consumer.id(),
                        );
                    }
                    Err(error) => {
                        error!(
                            "[participant_id {}] Failed to resume {:?} consumer {}: {}",
                            participant_id,
                            consumer.kind(),
                            consumer.id(),
                            error,
                        );
                    }
                }
            });
        }
    }
}

trait ConsumerUpdate {
    fn consumer_update(&mut self, server_message_sender: UnboundedSender<ServerMessage>);
}

impl ConsumerUpdate for Connection {
    fn consumer_update(&mut self, server_message_sender: UnboundedSender<ServerMessage>) {
        println!("HELLO WORLD");
        let _room = self.room.clone();
        let _display_name = self.display_name.clone();
        let _server_sender = server_message_sender.clone();

        // if let Err(e) = server_sender.send(ServerMessage::ConsumeUpdate {}) {
        //     error!("Error: {}", e)
        // }

        // r
        // let participant_id = self.id;
        // let transport = self.transports.consumer.clone();
        // let rtp_capabilities = match self.client_rtp_capabilities.clone() {
        //     Some(rtp_capabilities) => rtp_capabilities,
        //     None => {
        //         debug!(
        //             "[participant_id {}] Client should send RTP capabilities before \
        //             consuming",
        //             participant_id,
        //         );
        //         continue;
        //     }
        // };
        // // Create consumer for given producer ID, while first making sure that RTP
        // // capabilities were sent by the client prior to that
        // let server_sender = server_message_sender.clone();
        // let internal_sender = internal_message_sender.clone();
        // std::thread::spawn(move || {
        //     futures::executor::block_on(async move {
        //         let mut options = ConsumerOptions::new(producer_id, rtp_capabilities);
        //         options.paused = true;
        //
        //         match transport.consume(options).await {
        //             Ok(consumer) => {
        //                 let id = consumer.id();
        //                 let kind = consumer.kind();
        //                 let rtp_parameters = consumer.rtp_parameters().clone();
        //                 if let Err(e) = server_sender.send(ServerMessage::Consumed {
        //                     id,
        //                     producer_id,
        //                     kind,
        //                     rtp_parameters,
        //                 }) {
        //                     error!("send message error: {}", e);
        //                     internal_sender.send(InternalMessage::Stop).unwrap_or_default();
        //                     return;
        //                 }
        //                 // Consumer is stored in a hashmap since if we don't do it, it will
        //                 // get destroyed as soon as its instance goes out out scope
        //                 internal_sender.send(InternalMessage::SaveConsumer(consumer)).unwrap_or_default();
        //                 debug!(
        //                     "[participant_id {}] {:?} consumer created: {}",
        //                     participant_id, kind, id,
        //                 );
        //             }
        //             Err(error) => {
        //                 debug!(
        //                     "[participant_id {}] Failed to create consumer: {}",
        //                     participant_id, error,
        //                 );
        //                 internal_sender.send(InternalMessage::Stop).unwrap_or_default();
        //             }
        //         }
        //     })
        // });
    }
}
