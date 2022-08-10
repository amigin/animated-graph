use std::sync::Arc;

use my_socket_io_middleware::{my_socket_io_messages::MySocketIoMessage, MySocketIoConnection};

pub struct SocketIoConnection {
    my_socket_io: Arc<MySocketIoConnection>,
}

impl SocketIoConnection {
    pub fn new(my_socket_io: Arc<MySocketIoConnection>) -> Self {
        Self { my_socket_io }
    }

    pub fn get_id(&self) -> &str {
        self.my_socket_io.id.as_str()
    }

    pub async fn send_message(&self, message: &MySocketIoMessage) {
        self.my_socket_io.send_message(message).await
    }
}
