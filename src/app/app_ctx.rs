use std::sync::Arc;

use my_logger::MyLogger;
use rust_extensions::AppStates;

use crate::http_server::socket_io::SocketIoList;

pub struct AppContext {
    pub app_states: Arc<AppStates>,
    pub logger: Arc<MyLogger>,
    pub socket_io_list: SocketIoList,
}

impl AppContext {
    pub fn new() -> Self {
        Self {
            app_states: Arc::new(AppStates::create_initialized()),
            logger: Arc::new(MyLogger::to_console()),
            socket_io_list: SocketIoList::new(),
        }
    }
}
