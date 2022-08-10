use std::{net::SocketAddr, sync::Arc};

use my_http_server::{FilesMapping, MyHttpServer, StaticFilesMiddleware};
use my_socket_io_middleware::{MySocketIoConnectionsCallbacks, MySocketIoEngineMiddleware};

use crate::app::AppContext;

pub fn setup_server(app: &Arc<AppContext>) {
    let mut http_server = MyHttpServer::new(SocketAddr::from(([0, 0, 0, 0], 5566)));

    http_server.add_middleware(Arc::new(StaticFilesMiddleware::new(
        Some(vec![FilesMapping::new("/typescript", "./typescript")]),
        Some(vec!["/index.html".to_string()]),
    )));

    http_server.add_middleware(Arc::new(MySocketIoEngineMiddleware::new(Arc::new(
        MySocketIoConnectionsCallbacks::new(),
    ))));

    http_server.start(app.app_states.clone(), app.logger.clone());
}
