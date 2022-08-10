use std::sync::Arc;

use async_trait::async_trait;
use my_json::json_writer::{JsonArrayWriter, JsonObjectWriter};
use my_tcp_sockets::{ConnectionEvent, SocketEventCallback};
use rust_extensions::date_time::DateTimeAsMicroseconds;

use crate::app::AppContext;

use super::{MfxFeedSerializer, MfxTcpContract};

pub struct TcpConnectionEvents {
    app_ctx: Arc<AppContext>,
}

impl TcpConnectionEvents {
    pub fn new(app_ctx: Arc<AppContext>) -> Self {
        Self { app_ctx }
    }
}

#[async_trait]
impl SocketEventCallback<MfxTcpContract, MfxFeedSerializer> for TcpConnectionEvents {
    async fn handle(&self, connection_event: ConnectionEvent<MfxTcpContract, MfxFeedSerializer>) {
        match connection_event {
            ConnectionEvent::Connected(_) => {
                println!("Connected to MFX-Feed");
            }
            ConnectionEvent::Disconnected(_) => {
                println!("Disconnected from MFX-Feed");
            }
            ConnectionEvent::Payload {
                connection: _,
                payload,
            } => match payload {
                MfxTcpContract::BidAsk(mut bid_ask) => {
                    if bid_ask.id != "BTCUSD'" {
                        return;
                    }

                    bid_ask.id = "BTCUSD".to_string();
                    let sockets = self.app_ctx.socket_io_list.get_list().await;

                    if let Some(sockets) = sockets {
                        let now = DateTimeAsMicroseconds::now();
                        let mut json_writer = JsonArrayWriter::new();
                        json_writer.write_string_element("bid-ask");

                        let mut model_writer = JsonObjectWriter::new();
                        model_writer.write_string_value("id", &bid_ask.id);
                        model_writer.write_i64("dt", bid_ask.dt.unix_microseconds / 1000);
                        model_writer.write_i64("st", now.unix_microseconds / 1000);
                        model_writer.write_f64("bid", bid_ask.bid);
                        model_writer.write_f64("ask", bid_ask.ask);
                        json_writer.write_object(model_writer);

                        let payload = MySocketIoMessage::Message(MySocketIoTextMessage {
                            nsp: None,
                            data: MySocketIoTextData::Json(json_writer),
                            id: None,
                        });

                        for socket in sockets {
                            socket.send_message(&payload).await;
                        }
                    }
                }
                MfxTcpContract::Ping => {}
                MfxTcpContract::Pong => {}
            },
        }
    }
}
