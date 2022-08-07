use std::sync::Arc;

use my_web_sockets_middleware::MyWebSocket;
use rust_extensions::{date_time::DateTimeAsMicroseconds, TaskCompletion, TaskCompletionAwaiter};
use tokio::sync::Mutex;

use super::MySocketIoMessage;

pub struct MySocketIoSingleThreaded {
    web_socket: Option<Arc<MyWebSocket>>,
    long_pooling: Option<TaskCompletion<String, String>>,
    updgraded_to_websocket: bool,
}

pub struct MySocketIo {
    pub single_threaded: Mutex<MySocketIoSingleThreaded>,
    pub sid: String,
    pub created: DateTimeAsMicroseconds,
}

impl MySocketIo {
    pub fn new(sid: String) -> Self {
        Self {
            single_threaded: Mutex::new(MySocketIoSingleThreaded {
                web_socket: None,
                long_pooling: None,
                updgraded_to_websocket: false,
            }),
            sid,
            created: DateTimeAsMicroseconds::now(),
        }
    }

    pub async fn set_long_pooling_task(&self) -> TaskCompletionAwaiter<String, String> {
        let mut write_access = self.single_threaded.lock().await;

        if write_access.updgraded_to_websocket {
            return TaskCompletionAwaiter::create_completed(Ok(
                "Already upgraded to websocket".to_string()
            ));
        }

        if let Some(mut taken) = write_access.long_pooling.take() {
            taken.set_error(format!(
                "Canceling this LongPool since we got a new one {}.",
                self.sid
            ));
        }

        let mut task_completion = TaskCompletion::new();
        let result = task_completion.get_awaiter();
        write_access.long_pooling.replace(task_completion);

        result
    }

    /*
    pub async fn set_long_pooling_result(&self, msg: MySocketIoMessage) {
        let mut write_access = self.single_threaded.lock().await;
        let result = write_access.long_pooling.take();
        if let Some(mut result) = result {
            result.set_ok(msg.as_str().to_string());
        }
    }

     */
    pub async fn add_web_socket(&self, web_socket: Arc<MyWebSocket>) {
        let mut write_access = self.single_threaded.lock().await;
        if let Some(old_one) = write_access.web_socket.replace(web_socket) {
            old_one.disconnect().await;
        };
    }

    pub async fn has_web_socket(&self, web_socket_id: i64) -> bool {
        let read_access = self.single_threaded.lock().await;
        if let Some(web_socket) = read_access.web_socket.as_ref() {
            web_socket.id == web_socket_id
        } else {
            false
        }
    }

    /*
    pub async fn remove_web_socket(&self, web_socket_id: i64) {
        let mut write_access = self.single_threaded.lock().await;
        if let Some(old_one) = write_access.web_socket.take() {
            old_one.disconnect().await;
        };
    }
     */

    pub async fn upgrade_to_websocket(&self) {
        let mut write_access = self.single_threaded.lock().await;

        write_access.updgraded_to_websocket = true;
        if let Some(mut removed) = write_access.long_pooling.take() {
            removed.set_error(MySocketIoMessage::Disconnect.to_string());
        }
    }

    /*
    pub async fn send_message(&self, msg: MySocketIoMessage) {
        let str = msg.as_str();

        let web_socket = {
            let read_access = self.single_threaded.lock().await;
            if let Some(web_socket) = &read_access.web_socket {
                Some(web_socket.clone())
            } else {
                None
            }
        };

        if let Some(web_socket) = web_socket {
            web_socket
                .send_message(hyper_tungstenite::tungstenite::Message::Text(
                    str.to_string(),
                ))
                .await;
        }
    }
    */

    pub async fn disconnect(&self) {
        let mut write_access = self.single_threaded.lock().await;

        if let Some(web_socket) = write_access.web_socket.take() {
            web_socket.disconnect().await;
        }

        if let Some(mut long_pooling) = write_access.long_pooling.take() {
            long_pooling.set_error(format!("Canceling this LongPool since we disconnect it."));
        }
    }
}
