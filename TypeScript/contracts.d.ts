interface IBidAsk{
    id: String,
    bid: number,
    ask: number,
    timestamp: number,
    toRender: IAnimationRateData
}


interface IServerTime{
    timestamp: number,
}

interface IAnimationRateData{
    required: number,
    inRender: number,
}
