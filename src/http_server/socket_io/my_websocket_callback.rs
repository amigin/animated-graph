use std::sync::Arc;

use hyper_tungstenite::tungstenite::Message;
use my_http_server::HttpFailResult;
use my_web_sockets_middleware::{MyWebSockeCallback, MyWebSocket, WebSocketMessage};

use crate::{
    app::AppContext,
    http_server::socket_io::{MySocketIo, MySocketIoMessage},
};

pub struct SocketIoCallback {
    app: Arc<AppContext>,
}

impl SocketIoCallback {
    pub fn new(app: Arc<AppContext>) -> Self {
        Self { app }
    }
}

#[async_trait::async_trait]
impl MyWebSockeCallback for SocketIoCallback {
    async fn connected(&self, my_web_socket: Arc<MyWebSocket>) -> Result<(), HttpFailResult> {
        println!("connected web_socket:{}", my_web_socket.id);

        if let Some(query_string) = my_web_socket.get_query_string() {
            let sid = query_string.get_required("sid")?;

            match self.app.socket_io_list.get(sid.value).await {
                Some(socket_io) => {
                    socket_io.add_web_socket(my_web_socket).await;
                }
                None => {
                    let socket_io = MySocketIo::new(sid.value.to_string(), my_web_socket);
                    let socket_io = Arc::new(socket_io);
                    self.app.socket_io_list.add(socket_io).await;
                }
            };
        }

        Ok(())
    }
    async fn disconnected(&self, my_web_socket: Arc<MyWebSocket>) {
        println!("disconnected web_socket:{}", my_web_socket.id);
        self.app.socket_io_list.remove(my_web_socket.id).await;
    }
    async fn on_message(&self, my_web_socket: Arc<MyWebSocket>, message: WebSocketMessage) {
        println!("Websocket{}, MSG: {:?}", my_web_socket.id, message);

        if let WebSocketMessage::String(value) = &message {
            if value == "2probe" {
                my_web_socket
                    .send_message(Message::Text("3probe".to_string()))
                    .await;
            }

            if value == "5" {
                tokio::spawn(super::socket_io_ping_loop::start(my_web_socket.clone()));

                let my_socket_io = self
                    .app
                    .socket_io_list
                    .get_by_web_socket_io(my_web_socket.id)
                    .await;

                if let Some(my_socket_io) = my_socket_io {
                    my_socket_io.disconnect_except_mine(my_web_socket.id).await;
                }
            }
        }
    }
}