use std::sync::Arc;

use my_http_server::HttpFailResult;
use my_socket_io_middleware::{MySocketIoConnection, MySocketIoConnectionsCallbacks};

use crate::app::AppContext;

use super::SocketIoConnection;

pub struct SocketIoConnectionsCallback {
    app: Arc<AppContext>,
}

impl SocketIoConnectionsCallback {
    pub fn new(app: Arc<AppContext>) -> Self {
        Self { app }
    }
}

#[async_trait::async_trait]
impl MySocketIoConnectionsCallbacks for SocketIoConnectionsCallback {
    async fn connected(&self, socket_io: Arc<MySocketIoConnection>) -> Result<(), HttpFailResult> {
        let socket_io = Arc::new(SocketIoConnection::new(socket_io));
        self.app.socket_io_list.add(socket_io).await;
        Ok(())
    }
    async fn disconnected(&self, socket_io: Arc<MySocketIoConnection>) {
        self.app.socket_io_list.remove(&socket_io.id).await;
    }
}
