
interface IMaxMinAvg {
    max: number,
    min: number,
    last: number,
    minDate: number,
    maxDate: number,
}

class Prices {
    public history: IBidAsk[] = [];
    private last: IBidAsk;

    public minMaxPrice: IMaxMinAvg;

    public centerPrice: IAnimationRateData;

    public push(bidAsk: IBidAsk, serverTime: number) {

        this.assignRenderData(bidAsk);

        if (this.history.length > 200) {
            this.history.shift();
        }

        this.last = bidAsk;

        this.history.push(bidAsk);
        this.update_min_max(serverTime);
    }

    private update_min_max(serverTime: number) {
        let result: IMaxMinAvg;

        for (let price of this.history) {

            if (!result) {
                result = {
                    max: price.ask,
                    min: price.ask,
                    minDate: price.timestamp,
                    maxDate: price.timestamp,
                    last: price.ask,
                }
            }
            else {
                result.last = price.ask;
                if (result.max < price.ask) {
                    result.max = price.ask;
                }

                if (result.min > price.ask) {
                    result.min = price.ask;
                }
                result.maxDate = price.timestamp
            }
        }

        if (result) {
            if (!this.centerPrice) {
                this.centerPrice = {
                    inRender: result.last,
                    required: result.last,
                }
            }
            else {
                this.centerPrice.required = result.last;
            }

        }

        if (serverTime) {
            if (result.maxDate < serverTime) {
                result.maxDate = serverTime;
            }
        }

        this.minMaxPrice = result;
    }


    private assignRenderData(bidAsk: IBidAsk) {

        if (this.last) {
            bidAsk.toRender = {
                inRender: this.last.toRender.inRender,
                required: bidAsk.ask
            }
        }
        else {
            bidAsk.toRender = {
                inRender: bidAsk.ask,
                required: bidAsk.ask
            }
        }
    }
}