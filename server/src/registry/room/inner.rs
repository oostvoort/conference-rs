use std::collections::HashMap;
use std::fmt;
use std::sync::Arc;

use log::info;
use mediasoup::active_speaker_observer::ActiveSpeakerObserver;
use mediasoup::audio_level_observer::AudioLevelObserver;
use mediasoup::prelude::Router;
use parking_lot::Mutex;
use server::types::Id;
use tokio::sync::RwLock;
use y_sync::awareness::Awareness;
use yrs::Doc;

use super::handler::Handler;
use super::Participant;

/// Inner struct used by Room to abstract/hide the complex stuff.
/// Handles most of the mediasoup logic.
pub struct Inner {
    pub id: super::id::RoomId,
    pub router: Router,
    pub handlers: Handler,
    pub clients: Mutex<HashMap<Id, Participant>>,
    pub doc: Doc,
    pub awareness: Arc<RwLock<Awareness>>,
    pub share_screen_participant: Mutex<Option<Id>>,
    pub active_speaker_observer: ActiveSpeakerObserver,
    pub audio_level_observer: AudioLevelObserver,
}

impl fmt::Debug for Inner {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("Inner")
            .field("id", &self.id)
            .field("handlers", &"...")
            .field("clients", &self.clients)
            .field("share_screen_participant", &self.share_screen_participant)
            .finish()
    }
}

impl Drop for Inner {
    fn drop(&mut self) {
        info!("Room: {} closed", self.id);
        self.handlers.close.call_simple();
    }
}
