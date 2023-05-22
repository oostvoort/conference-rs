use super::{get_room, PathParameters, QueryParameters};
use crate::registry::room::participant::connection::Connection;
use crate::ServerState;
use axum::extract::{ConnectInfo, Path, Query, WebSocketUpgrade};
use axum::response::IntoResponse;
use axum::Extension;
use log::{error, info};
use server::utils;
use std::net::SocketAddr;

pub async fn handler(
    Path(PathParameters { room_id }): Path<PathParameters>,
    Query(QueryParameters {
        display_name,
        is_share_screen,
    }): Query<QueryParameters>,
    ws: WebSocketUpgrade,
    ConnectInfo(_addr): ConnectInfo<SocketAddr>,
    Extension(server_state): Extension<ServerState>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| async move {
        let room = match get_room(room_id, &server_state).await {
            Ok(room) => room,
            Err(error) => {
                error!("Error getting room: {}", error);
                return;
            }
        };

        let _display_name = match display_name {
            None => {
                let random_name = utils::gen_random_name();
                format!("🧀 {random_name} 🧀")
            }
            Some(name) => name,
        };

        info!("{_display_name} connecting to {}", room.id());

        let is_share_screen = match is_share_screen {
            Some(is_share_screen) => is_share_screen,
            None => false,
        };

        let participant_connection =
            match Connection::new(room, _display_name, is_share_screen).await {
                Ok(participant_connection) => participant_connection,
                Err(e) => {
                    error!("Failed to create transport: {}", e);
                    return;
                }
            };

        if let Err(e) = participant_connection.run(socket).await {
            error!("Error running participant connection {}", e)
        };
    })
}
