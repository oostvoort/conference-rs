use axum::extract::ws::{Message, WebSocket};
use log::{debug, error, info};
use server::types::Id;

use super::Room;

pub struct Connection {
    _id: Id,
    room: Room,
}

impl Connection {
    pub async fn new(room: Room) -> Result<Self, String> {
        Ok(Self {
            _id: Id::new(),
            room,
        })
    }

    pub async fn run(mut self, mut socket: WebSocket) -> anyhow::Result<()> {
        loop {
            tokio::select! {
                websocket_recv = socket.recv() => {
                    if let Some(result) = websocket_recv {
                        let message = result?;
                        match message {
                            Message::Binary(msg) => {
                                // y.doc changes/updates are sent as binary
                                // skip empty updates
                                if msg == [0, 2, 2, 0, 0] {
                                    continue;
                                }
                                let buffer = self.room.sync_doc(&msg).await;
                                for update in buffer {
                                    match &socket.send(Message::Binary(update)).await {
                                        Ok(_) => {continue;},
                                        Err(e) => {
                                            error!("send differential update to remote failed {e}");
                                            break
                                        }
                                    }
                                }
                            }
                            Message::Ping(bytes) => {
                                debug!("Ping!");
                                socket.send(Message::Pong(bytes)).await?;
                            }
                            Message::Pong(_) => {
                                debug!("Pong!")
                            }
                            Message::Close(close) => {
                                if let Some(close_frame) = close {
                                    debug!(
                                        "Received close frame: ({}, {})",
                                        close_frame.code,
                                        close_frame.reason
                                    );
                                }
                                socket.close().await?;
                                return Ok(());
                            }
                            Message::Text(msg) => {
                                info!("Unexpected text message ({})", msg);
                            }
                        }
                    }
                }
            }
        }
    }
}
