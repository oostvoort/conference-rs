use log::{debug, info};
use std::collections::hash_map::Entry;
use std::collections::HashMap;
use std::sync::Arc;

use mediasoup::prelude::*;
use room::subscription::Subscribe;
use room::weak::WeakRoom;
use room::Room;
use tokio::sync::Mutex;

pub mod room;

#[derive(Debug, Default, Clone)]
pub struct Registry {
    // We store `WeakRoom` instead of full `Room` to avoid cycles and to not prevent rooms from
    // being destroyed when last participant disconnects
    rooms: Arc<Mutex<HashMap<room::id::RoomId, WeakRoom>>>,
}

impl Registry {
    /// Retrieves existing room or creates a new one with specified `RoomId`
    pub async fn get_or_create_room(
        &self,
        worker_manager: &WorkerManager,
        room_id: room::id::RoomId,
    ) -> Result<Room, String> {
        // Lock the mutex to prevent issues like creating duplicates or collisions while we fetch a room
        let mut rooms = self.rooms.lock().await;

        // Check if room with room_id exists, if not create one
        match rooms.entry(room_id.clone()) {
            // Found a WeakRoom, upgrade the weak pointer and check if the value (room) is still present
            Entry::Occupied(mut entry) => match entry.get().upgrade() {
                Some(room) => {
                    debug!("Room {} found", room.id());
                    Ok(room)
                }
                None => {
                    // Weak pointer is pointing to None, create a new room instance
                    let room = Room::new_with_id(worker_manager, room_id).await?;
                    entry.insert(room.downgrade());
                    room.on_close({
                        let room_id = room.id();
                        let rooms = Arc::clone(&self.rooms);

                        move || {
                            tokio::spawn(async move {
                                rooms.lock().await.remove(&room_id);
                            });
                        }
                    })
                    .detach();

                    info!("Room {} created", room.id());
                    Ok(room)
                }
            },
            Entry::Vacant(entry) => {
                let room = Room::new_with_id(worker_manager, room_id).await?;
                entry.insert(room.downgrade());
                room.on_close(
                    self.on_close_callback(
                        room.id()
                    ))
                .detach();

                info!("Room {} created", room.id());
                Ok(room)
            }
        }
    }

    /// Create new room with random `RoomId`
    pub async fn create_room(&self, worker_manager: &WorkerManager) -> Result<Room, String> {
        let mut rooms = self.rooms.lock().await;
        let room = Room::new(worker_manager).await?;
        rooms.insert(room.id(), room.downgrade());
        room.on_close(
            self.on_close_callback(
                room.id()
            ))
            .detach();

        info!("Room {} created", room.id());
        Ok(room)
    }

    fn on_close_callback(&self, room_id: room::id::RoomId) -> impl FnOnce() + Send + Sync
    {
        {
            let rooms = Arc::clone(&self.rooms);

            move || {
                tokio::spawn(async move {
                    rooms.lock().await.remove(&room_id);
                });
            }
        }
    }
}
