
interface IMaxMinAvg {
    max: number,
    min: number,
    last: number,
    minDate: number,
    maxDate: number,
}

class Prices {
    public history: IBidAsk[] = [];
    public last: IBidAsk;
    public prev: IBidAsk;

    public minMaxPrice: IMaxMinAvg;

    public centerPrice: IAnimationRateData;

    public push(bidAsk: IBidAsk) {
        if (this.history.length > 2048) {
            this.history.shift();
        }

        this.prev = this.last;

        this.last = bidAsk;

        this.history.push(bidAsk);
        this.update_min_max(bidAsk.st);
    }

    private update_min_max(serverTime: number) {
        let result: IMaxMinAvg;

        for (let price of this.history) {

            if (!result) {
                result = {
                    max: price.ask,
                    min: price.ask,
                    minDate: price.dt,
                    maxDate: price.dt,
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
                result.maxDate = price.dt
            }
        }


        if (serverTime) {
            if (result.maxDate < serverTime) {
                result.maxDate = serverTime;
            }
        }

        this.minMaxPrice = result;
    }

}