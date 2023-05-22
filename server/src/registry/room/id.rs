use serde::{Deserialize, Serialize};
use std::fmt;
use uuid::Uuid;

#[derive(Debug, Clone, Eq, PartialEq, Hash, Ord, PartialOrd, Deserialize, Serialize)]
pub struct RoomId(String);

impl fmt::Display for RoomId {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt(&self.0, f)
    }
}

impl RoomId {
    pub fn new() -> Self {
        Self(Uuid::new_v4().to_string())
    }
}
