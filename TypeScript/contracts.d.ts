interface IBidAsk {
    id: String,
    bid: number,
    ask: number,
    dt: number,
    toRender: IBidAskToRender
    st: number,
}


interface IBidAskToRender {
    x: IAnimationData,
    y: IAnimationData,
}


interface IServerTime {
    timestamp: number,
}


interface IAnimationData {
    requred: number,
    inRender: number,
}


interface IAnimationRateData {
    rateRequred: number,
    rateInRender: number,
}