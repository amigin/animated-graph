use async_trait::async_trait;
use my_tcp_sockets::{
    socket_reader::{ReadBuffer, ReadingTcpContractFail, SocketReader},
    TcpSocketSerializer,
};

use super::MfxTcpContract;

pub static PING: &str = "PING";
pub static PONG: &str = "PONG";
static CLCR: &[u8] = &[13u8, 10u8];

pub struct MfxFeedSerializer {
    read_buffer: ReadBuffer,
}

impl MfxFeedSerializer {
    pub fn new() -> Self {
        Self {
            read_buffer: ReadBuffer::new(1024 * 5),
        }
    }
}

#[async_trait]
impl TcpSocketSerializer<MfxTcpContract> for MfxFeedSerializer {
    fn serialize(&self, contract: MfxTcpContract) -> Vec<u8> {
        contract.serialize()
    }

    fn serialize_ref(&self, contract: &MfxTcpContract) -> Vec<u8> {
        contract.serialize()
    }

    fn get_ping(&self) -> MfxTcpContract {
        MfxTcpContract::Ping
    }

    async fn deserialize<TSocketReader: Send + Sync + 'static + SocketReader>(
        &mut self,
        socket_reader: &mut TSocketReader,
    ) -> Result<MfxTcpContract, ReadingTcpContractFail> {
        let result = socket_reader
            .read_until_end_marker(&mut self.read_buffer, CLCR)
            .await?;

        let result = &result[0..result.len() - 2];
        let result = MfxTcpContract::deserialize(result);
        Ok(result)
    }

    fn apply_packet(&mut self, _contract: &MfxTcpContract) -> bool {
        false
    }
}
