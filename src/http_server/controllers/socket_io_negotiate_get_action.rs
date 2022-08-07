use my_http_server::{HttpContext, HttpFailResult, HttpOkResult, HttpOutput, WebContentType};

#[my_http_server_swagger::http_route(
    method: "GET",
    route: "/socket.io/",
    description: "socket.io negotiate action",
)]
pub struct SocketIoNegotiateGetAction {}

impl SocketIoNegotiateGetAction {
    pub fn new() -> Self {
        Self {}
    }
}

async fn handle_request(
    _action: &SocketIoNegotiateGetAction,
    _ctx: &HttpContext,
) -> Result<HttpOkResult, HttpFailResult> {
    let result = super::models::compile_negotiate_response("0011223344");

    HttpOutput::Content {
        headers: None,
        content_type: Some(WebContentType::Text),
        content: result.to_owned().into_bytes(),
    }
    .into_ok_result(true)
    .into()
}
