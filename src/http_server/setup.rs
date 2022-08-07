use std::{net::SocketAddr, sync::Arc};

use my_http_server::{FilesMapping, MyHttpServer, StaticFilesMiddleware};
use my_web_sockets_middleware::MyWebSocketsMiddleware;

use crate::app::AppContext;

use super::socket_io::SocketIoCallback;

pub fn setup_server(app: &Arc<AppContext>) {
    let mut http_server = MyHttpServer::new(SocketAddr::from(([0, 0, 0, 0], 5566)));

    http_server.add_middleware(Arc::new(StaticFilesMiddleware::new(
        Some(vec![FilesMapping::new("/typescript", "./typescript")]),
        Some(vec!["/index.html".to_string()]),
    )));

    http_server.add_middleware(Arc::new(MyWebSocketsMiddleware::new(
        "/socket.io/",
        Arc::new(SocketIoCallback::new(app.clone())),
    )));

    http_server.add_middleware(Arc::new(super::build_controllers(app)));

    http_server.start(app.app_states.clone(), app.logger.clone());
}
