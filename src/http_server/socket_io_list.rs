use std::{collections::HashMap, sync::Arc};

use my_socket_io_middleware::MySocketIoConnection;
use tokio::sync::RwLock;

pub struct SocketIoList {
    pub sockets: RwLock<HashMap<String, Arc<MySocketIoConnection<()>>>>,
}

impl SocketIoList {
    pub fn new() -> Self {
        Self {
            sockets: RwLock::new(HashMap::new()),
        }
    }

    pub async fn add(&self, socket_io: Arc<MySocketIoConnection<()>>) {
        let mut write_access = self.sockets.write().await;
        write_access.insert(socket_io.id.clone(), socket_io);
    }

    pub async fn get(&self, sid: &str) -> Option<Arc<MySocketIoConnection<()>>> {
        let read_access = self.sockets.read().await;
        let result = read_access.get(sid)?;
        Some(result.clone())
    }

    pub async fn get_list(&self) -> Option<Vec<Arc<MySocketIoConnection<()>>>> {
        let read_access = self.sockets.read().await;
        if read_access.len() == 0 {
            return None;
        }

        let mut result = Vec::with_capacity(read_access.len());

        for socket_io in read_access.values() {
            result.push(socket_io.clone());
        }

        Some(result)
    }

    pub async fn get_by_websocket_id(
        &self,
        web_socket_id: i64,
    ) -> Option<Arc<MySocketIoConnection<()>>> {
        let sockets = self.get_list().await?;

        for socket_io in sockets {
            if socket_io.has_web_socket(web_socket_id).await {
                return Some(socket_io.clone());
            }
        }

        None
    }

    pub async fn remove_by_id(&self, socket_io_id: &str) -> Option<Arc<MySocketIoConnection<()>>> {
        let mut write_access = self.sockets.write().await;
        write_access.remove(socket_io_id)
    }
}

#[async_trait::async_trait]
impl my_socket_io_middleware::SocketIoList<()> for SocketIoList {
    async fn add(&self, socket_io_connection: Arc<MySocketIoConnection<()>>) {
        self.add(socket_io_connection).await
    }

    async fn remove(&self, socket_io_id: &str) -> Option<Arc<MySocketIoConnection<()>>> {
        self.remove_by_id(socket_io_id).await
    }

    async fn get(&self, socket_io_id: &str) -> Option<Arc<MySocketIoConnection<()>>> {
        self.get(socket_io_id).await
    }
    async fn get_by_web_socket_id(
        &self,
        web_socket_id: i64,
    ) -> Option<Arc<MySocketIoConnection<()>>> {
        self.get_by_websocket_id(web_socket_id).await
    }
}
