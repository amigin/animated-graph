use std::sync::Arc;

use mfx_feed_client::{MfxFeedSerializer, TcpConnectionEvents};
use my_tcp_sockets::TcpClient;

mod app;
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

    crate::http_server::setup_server(&app);

    app.app_states.wait_until_shutdown().await;
}
