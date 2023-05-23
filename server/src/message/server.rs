use crate::registry::room::id::RoomId;
use mediasoup::consumer::ConsumerId;
use mediasoup::prelude::{MediaKind, ProducerId, RtpCapabilitiesFinalized, RtpParameters};
use serde::Serialize;
use server::types::{Id, TransportOptions};

/// Server messages sent to the client
#[derive(Serialize)]
#[serde(tag = "action")]
#[serde(rename_all = "PascalCase")]
pub enum ServerMessage {
    /// Initialization message with consumer/producer transport options and Router's RTP
    /// capabilities necessary to establish WebRTC transport connection client-side
    #[serde(rename_all = "camelCase")]
    Init {
        participant_id: Id,
        display_name: String,
        room_id: RoomId,
        is_share_screen: bool,
        consumer_transport_options: TransportOptions,
        producer_transport_options: TransportOptions,
        router_rtp_capabilities: RtpCapabilitiesFinalized,
    },

    /// Notification that new producer was added to the room
    #[serde(rename_all = "camelCase")]
    ProducerAdded {
        is_share_screen: bool,
        is_enabled: bool,
        participant_id: Id,
        display_name: String,
        producer_id: ProducerId,
    },

    /// Notification that producer was removed from the room
    #[serde(rename_all = "camelCase")]
    ProducerRemoved {
        participant_id: Id,
        producer_id: ProducerId,
    },

    /// Notification that producer transport was connected successfully (in case of error
    /// connection is just dropped, in real-world application you probably want to handle it
    /// better)
    ConnectedProducerTransport,

    /// Notification that producer was created on the server
    #[serde(rename_all = "camelCase")]
    Produced { id: ProducerId },

    /// Notification that consumer transport was connected successfully (in case of error
    /// connection is just dropped, in real-world application you probably want to handle it
    /// better)
    ConnectedConsumerTransport,

    /// Notification that consumer was successfully created server-side, client can resume
    /// the consumer after this
    #[serde(rename_all = "camelCase")]
    Consumed {
        id: ConsumerId,
        producer_id: ProducerId,
        kind: MediaKind,
        rtp_parameters: RtpParameters,
    },

    /// Notification that someone requested to toggle media state
    #[serde(rename_all = "camelCase")]
    ToggleMedia {
        participant_id: Id,
        kind: MediaKind,
        is_play: bool,
    },

    /// Notification that someone requested to broadcast action to all participants
    #[serde(rename_all = "camelCase")]
    BroadcastAction { kind: String, from: Id },
}
