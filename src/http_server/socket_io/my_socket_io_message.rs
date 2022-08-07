pub enum MySocketIoMessage {
    Ping,
    Pong,
}

impl MySocketIoMessage {
    pub fn as_str(&self) -> &str {
        match self {
            MySocketIoMessage::Ping => "2",
            MySocketIoMessage::Pong => "3",
        }
    }
}
