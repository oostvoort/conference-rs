use event_listener_primitives::{Bag, BagOnce};
use mediasoup::prelude::{MediaKind, Producer, ProducerId};
use server::types::Id;
use std::sync::Arc;

/// Event handlers similar to Node.js event listeners.
/// https://crates.io/crates/event-listener-primitives
#[derive(Default)]
pub struct Handler {
    pub producer_add:
        Bag<Arc<dyn Fn(&Id, &String, &Producer, &bool, &bool) + Send + Sync>, Id, String, Producer, bool, bool>,
    pub producer_remove: Bag<Arc<dyn Fn(&Id, &ProducerId) + Send + Sync>, Id, ProducerId>,
    pub toggle_media: Bag<Arc<dyn Fn(&Id, &MediaKind, &bool) + Send + Sync>, Id, MediaKind, bool>,
    pub broadcast_action: Bag<Arc<dyn Fn(&String, &Id) + Send + Sync>, String, Id>,
    pub close: BagOnce<Box<dyn FnOnce() + Send>>,
}
