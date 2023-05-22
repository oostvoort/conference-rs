use mediasoup::consumer::ConsumerId;
use mediasoup::data_structures::DtlsParameters;
use mediasoup::prelude::{MediaKind, ProducerId, RtpCapabilities, RtpParameters};
use serde::Deserialize;

/// Client messages sent to the server
#[derive(Deserialize)]
#[serde(tag = "action")]
pub enum ClientMessage {
    /// Client-side initialization with its RTP capabilities, in this simple case we expect
    /// those to match server Router's RTP capabilities
    #[serde(rename_all = "camelCase")]
    Init { rtp_capabilities: RtpCapabilities },
    
    /// Request to connect producer transport with client-side DTLS parameters
    #[serde(rename_all = "camelCase")]
    ConnectProducerTransport { dtls_parameters: DtlsParameters },
    
    /// Request to produce a new audio or video track with specified RTP parameters
    #[serde(rename_all = "camelCase")]
    Produce {
        kind: MediaKind,
        rtp_parameters: RtpParameters,
    },
    
    #[serde(rename_all = "camelCase")]
    ProducerUpdate { rtp_capabilities: RtpCapabilities },
    
    /// Request to connect consumer transport with client-side DTLS parameters
    #[serde(rename_all = "camelCase")]
    ConnectConsumerTransport { dtls_parameters: DtlsParameters },
    
    /// Request to consume specified producer
    #[serde(rename_all = "camelCase")]
    Consume { producer_id: ProducerId },
    
    /// Request to resume consumer that was previously created
    #[serde(rename_all = "camelCase")]
    ConsumerResume { id: ConsumerId },
    
    /// Request to update consumer RPT Capabilities
    #[serde(rename_all = "camelCase")]
    ConsumerUpdate {},
    
    /// Request to toggle media
    #[serde(rename_all = "camelCase")]
    ToggleMedia { kind: MediaKind },
    
    /// Request to broadcast an action to all participants
    #[serde(rename_all = "camelCase")]
    BroadcastAction { kind: String },
}
