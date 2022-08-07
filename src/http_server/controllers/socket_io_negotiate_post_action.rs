use my_http_server::{HttpContext, HttpFailResult, HttpOkResult, HttpOutput, WebContentType};

#[my_http_server_swagger::http_route(
    method: "POST",
    route: "/socket.io/",
    description: "socket.io negotiate action",
)]
pub struct SocketIoNegotiatePostAction {}

impl SocketIoNegotiatePostAction {
    pub fn new() -> Self {
        Self {}
    }
}

async fn handle_request(
    _action: &SocketIoNegotiatePostAction,
    ctx: &HttpContext,
) -> Result<HttpOkResult, HttpFailResult> {
    let query = ctx.request.get_query_string()?;

    let sid = query.get_required("sid")?;
    let result = super::models::compile_negotiate_response(sid.value);
    HttpOutput::Content {
        headers: None,
        content_type: Some(WebContentType::Text),
        content: result.to_owned().into_bytes(),
    }
    .into_ok_result(true)
    .into()
}
