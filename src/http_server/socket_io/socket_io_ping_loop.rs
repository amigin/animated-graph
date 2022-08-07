use std::{sync::Arc, time::Duration};

use hyper_tungstenite::tungstenite::Message;
use my_web_sockets_middleware::MyWebSocket;

pub async fn start(socket: Arc<MyWebSocket>) {
    println!("Socket {} started ping loop", socket.id);
    while socket.is_connected() {
        socket
            .send_message(Message::Text("2probe".to_string()))
            .await;

        tokio::time::sleep(Duration::from_secs(2)).await;
    }

    println!("Socket {} exited ping loop", socket.id);
}
