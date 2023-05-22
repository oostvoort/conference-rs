use mediasoup::data_structures::{DtlsParameters, IceCandidate, IceParameters};
use mediasoup::transport::TransportId;
use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

/// Data structure containing all the necessary information about transport options required
/// from the server to establish transport connection on the client
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TransportOptions {
    pub id: TransportId,
    pub dtls_parameters: DtlsParameters,
    pub ice_candidates: Vec<IceCandidate>,
    pub ice_parameters: IceParameters,
}

#[derive(Debug, Clone, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize)]
pub struct Id(Uuid);

impl fmt::Display for Id {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt(&self.0, f)
    }
}

impl Id {
    pub fn new() -> Self {
        Self(Uuid::new_v4())
    }
}
