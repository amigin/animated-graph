import { AppContext } from './app-ctx';

export interface IMaxMinAvg {
    max: number,
    min: number,
    last: number,
    minDate: number,
    maxDate: number,
}

export class Prices {
    public history: IBidAsk[] = [];
    private last: IBidAsk;

    public static minMaxPrice: IMaxMinAvg;

    public static centerPrice: IAnimationRateData;


    public push(bidAsk: IBidAsk) {

        this.assignRenderData(bidAsk);

        if (this.history.length > 200) {
            this.history.shift();
        }

        this.last = bidAsk;

        this.history.push(bidAsk);
        this.update_min_max();
    }

    private update_min_max() {
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
            if (!Prices.centerPrice) {
                Prices.centerPrice = {
                    inRender: result.last,
                    required: result.last,
                }
            }
            else {
                Prices.centerPrice.required = result.last;
            }

        }

        if (AppContext.serverTime) {
            if (result.maxDate < AppContext.serverTime) {
                result.maxDate = AppContext.serverTime;
            }
        }

        Prices.minMaxPrice = result;
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