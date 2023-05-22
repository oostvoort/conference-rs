use mediasoup::prelude::Producer;
use std::fmt;

pub mod connection;
pub mod interpret;
pub mod subscribe;

#[derive(Default)]
pub struct Participant {
    pub is_share_screen: bool,
    pub display_name: String,
    pub producers: Vec<Producer>,
}

impl fmt::Debug for Participant {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("RoomParticipant")
            .field("is_share_screen", &self.is_share_screen)
            .field("display_name", &self.display_name)
            .field("producers", &self.producers)
            .finish()
    }
}
