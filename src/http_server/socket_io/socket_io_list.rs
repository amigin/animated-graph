use std::{collections::HashMap, sync::Arc};

use tokio::sync::RwLock;

use super::MySocketIo;

pub struct SocketIoList {
    pub sockets: RwLock<HashMap<String, Arc<MySocketIo>>>,
}

impl SocketIoList {
    pub fn new() -> Self {
        Self {
            sockets: RwLock::new(HashMap::new()),
        }
    }

    pub async fn add(&self, socket_io: Arc<MySocketIo>) {
        let mut write_access = self.sockets.write().await;
        write_access.insert(socket_io.sid.clone(), socket_io);
    }

    pub async fn get(&self, sid: &str) -> Option<Arc<MySocketIo>> {
        let read_access = self.sockets.read().await;
        let result = read_access.get(sid)?;
        Some(result.clone())
    }

    pub async fn remove(&self, web_socket_id: i64) {
        let mut write_access = self.sockets.write().await;

        if let Some(socket_io) = find_socket_io(&write_access, web_socket_id).await {
            if socket_io.remove_web_socket(web_socket_id).await == 0 {
                write_access.remove(&socket_io.sid);
            }
        }
    }

    pub async fn get_by_web_socket_io(&self, web_socket_id: i64) -> Option<Arc<MySocketIo>> {
        let read_access = self.sockets.read().await;

        for socket_io in read_access.values() {
            if socket_io.has_web_socket(web_socket_id).await {
                return Some(socket_io.clone());
            }
        }

        None
    }
}

async fn find_socket_io(
    items: &HashMap<String, Arc<MySocketIo>>,
    web_socket_id: i64,
) -> Option<Arc<MySocketIo>> {
    for socket_io in items.values() {
        if socket_io.has_web_socket(web_socket_id).await {
            return Some(socket_io.clone());
        }
    }

    None
}
