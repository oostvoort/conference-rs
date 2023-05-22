use crate::registry::room::{id, Room};
use crate::ServerState;
use anyhow::Error;
use serde::Deserialize;

pub mod collaborate;
pub mod meet;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryParameters {
    pub display_name: Option<String>,
    pub is_share_screen: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct PathParameters {
    pub room_id: Option<id::RoomId>,
}

pub async fn get_room(
    room_id: Option<id::RoomId>,
    server_state: &ServerState,
) -> Result<Room, Error> {
    match room_id {
        None => server_state
            .rooms_registry
            .create_room(&server_state.worker_manager)
            .await
            .map_err(Error::msg),
        Some(room_id) => server_state
            .rooms_registry
            .get_or_create_room(&server_state.worker_manager, room_id)
            .await
            .map_err(Error::msg),
    }
}
