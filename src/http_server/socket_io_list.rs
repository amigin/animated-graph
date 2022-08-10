use std::{collections::HashMap, sync::Arc};

use tokio::sync::RwLock;

use super::SocketIoConnection;

pub struct SocketIoList {
    pub sockets: RwLock<HashMap<String, Arc<SocketIoConnection>>>,
}

impl SocketIoList {
    pub fn new() -> Self {
        Self {
            sockets: RwLock::new(HashMap::new()),
        }
    }

    pub async fn add(&self, socket_io: Arc<SocketIoConnection>) {
        let mut write_access = self.sockets.write().await;
        write_access.insert(socket_io.get_id().to_string(), socket_io);
    }

    pub async fn get_list(&self) -> Option<Vec<Arc<SocketIoConnection>>> {
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

    pub async fn remove(&self, socket_io_id: &str) -> Option<Arc<SocketIoConnection>> {
        let mut write_access = self.sockets.write().await;
        write_access.remove(socket_io_id)
    }
}
