use std::sync::Arc;

use my_http_server::{HttpContext, HttpFailResult, HttpOkResult, HttpOutput, WebContentType};

use crate::{app::AppContext, http_server::socket_io::MySocketIo};

#[my_http_server_swagger::http_route(
    method: "GET",
    route: "/socket.io/",
    description: "socket.io negotiate action",
)]
pub struct SocketIoNegotiateGetAction {
    app: Arc<AppContext>,
}

impl SocketIoNegotiateGetAction {
    pub fn new(app: Arc<AppContext>) -> Self {
        Self { app }
    }
}

async fn handle_request(
    action: &SocketIoNegotiateGetAction,
    ctx: &HttpContext,
) -> Result<HttpOkResult, HttpFailResult> {
    let query = ctx.request.get_query_string()?;

    let sid = query.get_optional("sid");

    if let Some(sid) = sid {
        println!("Get with Id:{}", sid.value);

        return HttpOutput::Content {
            headers: None,
            content_type: Some(WebContentType::Text),
            content: "5".to_string().into_bytes(),
        }
        .into_ok_result(true)
        .into();

        //  return super::handle_long_pool(&action.app, sid.value).await;
    } else {
        let sid = uuid::Uuid::new_v4().to_string();

        let sid = sid.replace("-", "")[..8].to_string();
        println!("Create new Id:{}", sid);

        let result = super::models::compile_negotiate_response(sid.as_str());

        let socket_io = MySocketIo::new(sid);

        action.app.socket_io_list.add(Arc::new(socket_io)).await;

        HttpOutput::Content {
            headers: None,
            content_type: Some(WebContentType::Text),
            content: result.to_owned().into_bytes(),
        }
        .into_ok_result(true)
        .into()
    }
}
