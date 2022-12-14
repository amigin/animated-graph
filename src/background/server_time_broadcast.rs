use std::sync::Arc;

use my_json::json_writer::JsonArrayWriter;
use my_socket_io_middleware::my_socket_io_messages::*;
use rust_extensions::{date_time::DateTimeAsMicroseconds, MyTimerTick};

use crate::app::AppContext;

pub struct ServerTimeBroadcast {
    app: Arc<AppContext>,
}

impl ServerTimeBroadcast {
    pub fn new(app: Arc<AppContext>) -> Self {
        Self { app }
    }
}

#[async_trait::async_trait]
impl MyTimerTick for ServerTimeBroadcast {
    async fn tick(&self) {
        let sockets = self.app.socket_io_list.get_list().await;

        if let Some(sockets) = sockets {
            let dt = DateTimeAsMicroseconds::now();

            let mut array_writer = JsonArrayWriter::new();
            array_writer.write_string_element("st");
            array_writer.write_number_element((dt.unix_microseconds / 1000).to_string().as_str());

            let payload = MySocketIoMessage::Message(MySocketIoTextPayload {
                nsp: None,
                data: String::from_utf8(array_writer.build()).unwrap(),
                id: None,
            });

            for socket in sockets {
                socket.send_message(&payload).await;
            }
        }
    }
}
