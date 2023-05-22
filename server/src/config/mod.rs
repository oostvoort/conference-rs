use mediasoup::data_structures::ListenIp;
use mediasoup::prelude::{
    MimeTypeAudio, MimeTypeVideo, RtcpFeedback, RtpCodecCapability, RtpCodecParametersParameters,
    TransportListenIps, WebRtcTransportOptions, WorkerSettings,
};
use std::net::{IpAddr, Ipv4Addr};
use std::num::{NonZeroU32, NonZeroU8};

use mediasoup::rtp_parameters::RtpCodecParametersParametersValue;
use mediasoup::worker::{WorkerLogLevel, WorkerLogTag};

pub fn worker_settings() -> WorkerSettings {
    let mut settings = WorkerSettings::default();

    let rtc_port_range_start: u16 = super::utils::get_env("RTC_PORT_RANGE_START", "40000")
        .parse()
        .expect("Invalid RTC_PORT_RANGE_START");
    let rtc_port_range_end: u16 = super::utils::get_env("RTC_PORT_RANGE_END", "40050")
        .parse()
        .expect("RTC_PORT_RANGE_START");

    settings.rtc_ports_range = rtc_port_range_start..=rtc_port_range_end;
    settings.log_level = WorkerLogLevel::Debug;
    settings.log_tags = vec![
        WorkerLogTag::Info,
        WorkerLogTag::Ice,
        WorkerLogTag::Dtls,
        WorkerLogTag::Rtp,
        WorkerLogTag::Srtp,
        WorkerLogTag::Rtcp,
        WorkerLogTag::Rtx,
        WorkerLogTag::Bwe,
        WorkerLogTag::Score,
        WorkerLogTag::Simulcast,
        WorkerLogTag::Svc,
        WorkerLogTag::Sctp,
        WorkerLogTag::Message,
    ];
    settings
}

/// List of codecs that SFU will accept from clients
pub fn media_codecs() -> Vec<RtpCodecCapability> {
    vec![
        RtpCodecCapability::Audio {
            mime_type: MimeTypeAudio::Opus,
            preferred_payload_type: None,
            clock_rate: NonZeroU32::new(48000).unwrap(),
            channels: NonZeroU8::new(2).unwrap(),
            parameters: RtpCodecParametersParameters::from([(
                "useinbandfec",
                RtpCodecParametersParametersValue::Number(1u32),
            )]),
            rtcp_feedback: vec![RtcpFeedback::TransportCc],
        },
        RtpCodecCapability::Video {
            mime_type: MimeTypeVideo::Vp8,
            preferred_payload_type: None,
            clock_rate: NonZeroU32::new(90000).unwrap(),
            parameters: RtpCodecParametersParameters::default(),
            rtcp_feedback: vec![
                RtcpFeedback::Nack,
                RtcpFeedback::NackPli,
                RtcpFeedback::CcmFir,
                RtcpFeedback::GoogRemb,
                RtcpFeedback::TransportCc,
            ],
        },
    ]
}

pub fn participant_transport_options() -> WebRtcTransportOptions {
    let webrtc_listen_ip: Ipv4Addr = super::utils::get_env("WEBRTC_LISTEN_IP", "127.0.0.1")
        .parse()
        .unwrap_or(Ipv4Addr::LOCALHOST);
    let webrtc_announced_ip: Option<IpAddr> =
        match super::utils::get_env("WEBRTC_ANNOUNCED_IP", "127.0.0.1").parse() {
            Ok(ip) => Some(ip),
            Err(_) => None,
        };
    WebRtcTransportOptions::new(TransportListenIps::new(ListenIp {
        ip: IpAddr::V4(webrtc_listen_ip),
        announced_ip: webrtc_announced_ip,
    }))
}
