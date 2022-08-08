interface IBidAsk {
    id: String,
    bid: number,
    ask: number,
    dt: number,
    toRender: IAnimationYData
    st: number,
}



interface IServerTime {
    timestamp: number,
}

interface IAnimationYData {
    yRequred: number,
    yInRender: number,
}


interface IAnimationRateData {
    rateRequred: number,
    rateInRender: number,
}