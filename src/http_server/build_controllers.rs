use std::sync::Arc;

use my_http_server_controllers::controllers::ControllersMiddleware;

use crate::app::AppContext;

pub fn build_controllers(app: &Arc<AppContext>) -> ControllersMiddleware {
    let mut controlers = ControllersMiddleware::new();

    controlers.register_get_action(Arc::new(
        super::controllers::SocketIoNegotiateGetAction::new(app.clone()),
    ));

    controlers.register_post_action(Arc::new(
        super::controllers::SocketIoNegotiatePostAction::new(app.clone()),
    ));

    controlers
}
