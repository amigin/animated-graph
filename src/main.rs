use std::sync::Arc;

mod app;
mod http_server;

#[tokio::main]
async fn main() {
    let app = app::AppContext::new();
    let app = Arc::new(app);

    crate::http_server::setup_server(&app);

    app.app_states.wait_until_shutdown().await;
}
