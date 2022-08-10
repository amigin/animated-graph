use my_socket_io_middleware::MySocketIoConnection;

pub struct SocketIoConnection {
    my_socket_io: MySocketIoConnection,
}

impl SocketIoConnection {
    pub fn new(my_socket_io: MySocketIoConnection) -> Self {
        Self { my_socket_io }
    }
}
