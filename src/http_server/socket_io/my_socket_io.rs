use std::{collections::HashMap, sync::Arc};

use my_web_sockets_middleware::MyWebSocket;
use tokio::sync::RwLock;

use super::MySocketIoMessage;

pub struct MySocketIo {
    pub web_sockets: RwLock<HashMap<i64, Arc<MyWebSocket>>>,
    pub sid: String,
}

impl MySocketIo {
    pub fn new(sid: String, web_socket: Arc<MyWebSocket>) -> Self {
        let mut hash_map = HashMap::new();
        hash_map.insert(web_socket.id, web_socket);

        Self {
            web_sockets: RwLock::new(hash_map),
            sid,
        }
    }

    pub async fn add_web_socket(&self, web_socket: Arc<MyWebSocket>) {
        let mut write_access = self.web_sockets.write().await;
        write_access.insert(web_socket.id, web_socket);

        println!(
            "SocketId {} now has connnections amount: {}",
            self.sid,
            write_access.len()
        );
    }

    pub async fn has_web_socket(&self, web_socket_id: i64) -> bool {
        let read_access = self.web_sockets.read().await;
        read_access.contains_key(&web_socket_id)
    }

    pub async fn remove_web_socket(&self, web_socket_id: i64) -> usize {
        let mut write_access = self.web_sockets.write().await;
        write_access.remove(&web_socket_id);
        return write_access.len();
    }

    pub async fn disconnect_except_mine(&self, web_socket_id: i64) {
        let mut write_access = self.web_sockets.write().await;

        let mut ids = Vec::with_capacity(write_access.len());

        for id in write_access.keys() {
            if *id != web_socket_id {
                ids.push(*id);
            }
        }

        for id in ids {
            let web_socket = write_access.remove(&id);

            if let Some(web_socket) = web_socket {
                println!("SocketIO disconnects socket: {}", web_socket.id);
                web_socket.disconnect().await;
            }
        }
    }

    async fn get_all(&self) -> Vec<Arc<MyWebSocket>> {
        let read_access = self.web_sockets.read().await;
        let mut result = Vec::with_capacity(read_access.len());

        for web_socket in read_access.values() {
            result.push(web_socket.clone());
        }

        result
    }

    pub async fn send_message(&self, msg: MySocketIoMessage) {
        let str = msg.as_str();

        for web_socket in self.get_all().await {
            web_socket
                .send_message(hyper_tungstenite::tungstenite::Message::Text(
                    str.to_string(),
                ))
                .await;
        }
    }
}
