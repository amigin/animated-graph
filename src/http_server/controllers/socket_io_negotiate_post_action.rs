use std::sync::Arc;

use my_http_server::{HttpContext, HttpFailResult, HttpOkResult, HttpOutput};

use crate::app::AppContext;

#[my_http_server_swagger::http_route(
    method: "POST",
    route: "/socket.io/",
    description: "socket.io negotiate action",
)]
pub struct SocketIoNegotiatePostAction {
    app: Arc<AppContext>,
}

impl SocketIoNegotiatePostAction {
    pub fn new(app: Arc<AppContext>) -> Self {
        Self { app }
    }
}

async fn handle_request(
    _action: &SocketIoNegotiatePostAction,
    ctx: &HttpContext,
) -> Result<HttpOkResult, HttpFailResult> {
    let query = ctx.request.get_query_string()?;

    let sid = query.get_required("sid")?;
    println!("Post with Id:{}", sid.value);
    HttpOutput::Empty.into_ok_result(false).into()
}
