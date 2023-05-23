use std::sync::Arc;

use event_listener_primitives::HandlerId;
use mediasoup::prelude::{MediaKind, Producer, ProducerId};

use server::types::Id;

pub trait Subscribe {
    /// Subscribe to notifications when new producer is added to the room
    fn on_producer_add<F: Fn(&Id, &String, &Producer, &bool, &bool) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId;

    /// Subscribe to notifications when producer is removed from the room
    fn on_producer_remove<F: Fn(&Id, &ProducerId) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId;

    /// Subscribe to notifications when media is toggled
    fn on_toggle_media<F: Fn(&Id, &MediaKind, &bool) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId;

    /// Subscribe to notification when room is closed
    fn on_close<F: FnOnce() + Send + 'static>(&self, callback: F) -> HandlerId;

    /// Subscribe to action being broadcast
    fn on_action_broadcast<F: Fn(&String, &Id) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId;
}

impl Subscribe for super::Room {
    /// Subscribe to notifications when new producer is added to the room
    fn on_producer_add<F: Fn(&Id, &String, &Producer, &bool, &bool) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId {
        self.inner.handlers.producer_add.add(Arc::new(callback))
    }

    /// Subscribe to notifications when producer is removed from the room
    fn on_producer_remove<F: Fn(&Id, &ProducerId) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId {
        self.inner.handlers.producer_remove.add(Arc::new(callback))
    }

    /// Subscribe to toggle media transmission
    fn on_toggle_media<F: Fn(&Id, &MediaKind, &bool) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId {
        self.inner.handlers.toggle_media.add(Arc::new(callback))
    }

    /// Subscribe to notification when room is closed
    fn on_close<F: FnOnce() + Send + 'static>(&self, callback: F) -> HandlerId {
        self.inner.handlers.close.add(Box::new(callback))
    }

    /// Subscribe to action being broadcast
    fn on_action_broadcast<F: Fn(&String, &Id) + Send + Sync + 'static>(
        &self,
        callback: F,
    ) -> HandlerId {
        self.inner.handlers.broadcast_action.add(Arc::new(callback))
    }
}
