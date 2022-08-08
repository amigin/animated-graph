use my_tcp_sockets::tcp_connection::TcpContract;
use rust_extensions::date_time::DateTimeAsMicroseconds;

use super::tcp_serializer::{PING, PONG};

pub enum MfxTcpContract {
    BidAsk(BidAskTcpData),
    Ping,
    Pong,
}

impl MfxTcpContract {
    pub fn serialize(&self) -> Vec<u8> {
        match self {
            MfxTcpContract::BidAsk(bid_ask) => bid_ask.serialize(),
            MfxTcpContract::Ping => return PING.as_bytes().to_vec(),
            MfxTcpContract::Pong => return PONG.as_bytes().to_vec(),
        }
    }

    pub fn deserialize(src: &[u8]) -> Self {
        let mut id = None;
        let mut dt = None;
        let mut bid: Option<f64> = None;
        let mut ask: Option<f64> = None;

        let mut no = 0;

        let src = std::str::from_utf8(src).unwrap();

        for itm in src.split(' ') {
            if no == 0 {
                if itm == PING {
                    return Self::Ping;
                }

                if itm == PONG {
                    return Self::Pong;
                }

                id = Some(itm.to_string());
            } else if no == 1 {
                dt = Some(deserialize_date_time(itm))
            } else if no == 2 {
                bid = Some(itm.parse().unwrap());
            } else if no == 3 {
                ask = Some(itm.parse().unwrap());
            }

            no += 1;
        }

        Self::BidAsk(BidAskTcpData {
            id: id.unwrap(),
            dt: dt.unwrap(),
            bid: bid.unwrap(),
            ask: ask.unwrap(),
        })
    }
}

pub struct BidAskTcpData {
    pub id: String,
    pub dt: DateTimeAsMicroseconds,
    pub bid: f64,
    pub ask: f64,
}
impl BidAskTcpData {
    pub fn serialize(&self) -> Vec<u8> {
        let mut result = Vec::with_capacity(256);

        result.extend_from_slice(self.id.as_bytes());
        result.push(' ' as u8);

        serialize_date_time(&self.dt, &mut result);
        result.push(' ' as u8);

        result.extend_from_slice(format!("{}", self.bid).as_bytes());
        result.push(' ' as u8);
        result.extend_from_slice(format!("{}", self.ask).as_bytes());
        result.push(13);
        result.push(10);
        result
    }
}

impl TcpContract for MfxTcpContract {
    fn is_pong(&self) -> bool {
        match self {
            MfxTcpContract::Pong => true,
            _ => false,
        }
    }
}

pub fn serialize_date_time(dt: &DateTimeAsMicroseconds, dest: &mut Vec<u8>) {
    let date = dt.to_rfc3339();

    dest.extend_from_slice(date[..4].as_bytes());
    dest.extend_from_slice(date[5..7].as_bytes());
    dest.extend_from_slice(date[8..10].as_bytes());
    dest.extend_from_slice(date[11..13].as_bytes());
    dest.extend_from_slice(date[14..16].as_bytes());
    dest.extend_from_slice(date[17..19].as_bytes());
    dest.extend_from_slice(date[20..23].as_bytes());
}

fn deserialize_date_time(src: &str) -> DateTimeAsMicroseconds {
    let year = src[..4].parse().unwrap();
    let month = src[4..6].parse().unwrap();
    let day = src[6..8].parse().unwrap();
    let h = src[8..10].parse().unwrap();
    let m = src[10..12].parse().unwrap();
    let s = src[12..14].parse().unwrap();
    let mut ms = src[14..17].parse().unwrap();
    ms *= 1000;
    DateTimeAsMicroseconds::create(year, month, day, h, m, s, ms)
}

#[cfg(test)]
mod tests {
    use rust_extensions::date_time::DateTimeAsMicroseconds;

    use super::*;

    #[test]
    fn test_serialize_datetime() {
        let dt = DateTimeAsMicroseconds::create(2020, 01, 05, 10, 02, 03, 123456);

        let mut result = Vec::new();
        serialize_date_time(&dt, &mut result);

        let result = String::from_utf8(result).unwrap();

        assert_eq!(result.as_str(), "20200105100203123");

        let dt = deserialize_date_time(result.as_str());

        assert_eq!("2020-01-05T10:02:03.123", &dt.to_rfc3339()[0..23]);
    }
}
