use std::{sync::Arc, time::Duration};

use background::ServerTimeBroadcast;
use mfx_feed_client::{MfxFeedSerializer, TcpConnectionEvents};
use my_tcp_sockets::TcpClient;
use rust_extensions::MyTimer;

mod app;
mod background;
mod http_server;
mod mfx_feed_client;

#[tokio::main]
async fn main() {
    let app = app::AppContext::new();
    let app = Arc::new(app);

    let client = TcpClient::new("MFXFeed".to_string(), "127.0.0.1:8090".to_string());

    client
        .start(
            Arc::new(|| -> MfxFeedSerializer { MfxFeedSerializer::new() }),
            Arc::new(TcpConnectionEvents::new(app.clone())),
            app.logger.clone(),
        )
        .await;

    let mut timer_1s = MyTimer::new(Duration::from_secs(1));
    timer_1s.register_timer(
        "ServerTimeBroadcast",
        Arc::new(ServerTimeBroadcast::new(app.clone())),
    );

    timer_1s.start(app.app_states.clone(), app.logger.clone());

    crate::http_server::setup_server(&app);

    app.app_states.wait_until_shutdown().await;
}
