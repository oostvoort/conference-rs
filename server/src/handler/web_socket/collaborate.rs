use super::PathParameters;
use crate::registry::room::collaborator::Connection;
use crate::ServerState;
use axum::extract::{ConnectInfo, Path, WebSocketUpgrade};
use axum::response::IntoResponse;
use axum::Extension;
use log::error;
use std::net::SocketAddr;

pub async fn handler(
    Path(PathParameters { room_id }): Path<PathParameters>,
    ws: WebSocketUpgrade,
    ConnectInfo(_addr): ConnectInfo<SocketAddr>,
    Extension(server_state): Extension<ServerState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| async move {
        let room = match super::get_room(room_id, &server_state).await {
            Ok(room) => room,
            Err(error) => {
                error!("Error getting room: {}", error);
                return;
            }
        };

        let collaborator_connection = match Connection::new(room).await {
            Ok(participant_connection) => participant_connection,
            Err(e) => {
                error!("Failed to create transport: {}", e);
                return;
            }
        };

        if let Err(e) = collaborator_connection.run(socket).await {
            error!("Error running collaborator connection {}", e)
        };
    })
}
