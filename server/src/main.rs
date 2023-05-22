use std::net::SocketAddr;

use axum::routing::get_service;
use axum::{routing::get, Router};
use log::info;
use mediasoup::prelude::WorkerManager;
use tower_http::add_extension::AddExtensionLayer;
use tower_http::services::{ServeDir, ServeFile};

use crate::handler::web_socket;
use crate::registry::Registry;

mod handler;
mod message;
mod registry;

#[derive(Clone)]
pub struct ServerState {
    pub worker_manager: WorkerManager,
    pub rooms_registry: Registry,
}

#[tokio::main]
async fn main() {
    env_logger::init();

    dotenvy::from_filename(".env").unwrap_or_default();

    let worker_manager = WorkerManager::new();
    let rooms_registry = Registry::default();

    let app = Router::new()
        .route("/api/meet/:room_id", get(web_socket::meet::handler))
        .route(
            "/api/collaborate/:room_id",
            get(web_socket::collaborate::handler),
        )
        .nest_service("/assets", get_service(ServeDir::new("./static/assets")))
        .fallback_service(get_service(ServeFile::new("./static/index.html")))
        .layer(AddExtensionLayer::new(ServerState {
            worker_manager,
            rooms_registry,
        }));

    let server_port: u16 = server::utils::get_env("SERVER_PORT", "3000")
        .parse()
        .expect("Invalid SERVER_PORT");

    let addr = SocketAddr::from(([0, 0, 0, 0], server_port));

    info!("✅ Listening on {}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service_with_connect_info::<SocketAddr>())
        .await
        .unwrap();
}
