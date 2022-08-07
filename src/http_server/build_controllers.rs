use std::sync::Arc;

use my_http_server_controllers::controllers::ControllersMiddleware;

pub fn build_controllers() -> ControllersMiddleware {
    let mut controlers = ControllersMiddleware::new();

    controlers.register_get_action(Arc::new(
        super::controllers::SocketIoNegotiateGetAction::new(),
    ));

    controlers.register_post_action(Arc::new(
        super::controllers::SocketIoNegotiatePostAction::new(),
    ));

    controlers
}
