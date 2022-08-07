
const digits: number = 2;
const multiplier: number = 100;


const gridStep = 100;

const dateGridOffset = 100;
const dateGridStep = 240;

class GraphRenderer {

    public static Background = "white";
    public static Grids = "gray";
    public static Chart = "green";
    public static Text = "Black";

    public static renderGrid() {


        let i = AppContext.screenSettings.canvasCenter - gridStep;
        while (i > 0) {
            AppContext.ctx.beginPath();
            AppContext.ctx.moveTo(0, i);
            AppContext.ctx.lineTo(AppContext.canvas.width, i);
            AppContext.ctx.stroke();
            i -= gridStep;
        }

        i = AppContext.screenSettings.canvasCenter + gridStep;

        while (i < AppContext.canvas.height) {
            AppContext.ctx.beginPath();
            AppContext.ctx.moveTo(0, i);
            AppContext.ctx.lineTo(AppContext.canvas.width, i);
            AppContext.ctx.stroke();
            i += gridStep;
        }

        i = dateGridOffset;

        while (i < AppContext.canvas.width) {
            AppContext.ctx.beginPath();
            AppContext.ctx.moveTo(i, 0);
            AppContext.ctx.lineTo(i, AppContext.canvas.height);
            AppContext.ctx.stroke();
            i += dateGridStep;
        }
    }

    public static renderPrices() {
        adjustChartRatePixel(AppContext.prices.centerPrice);
        AppContext.ctx.fillStyle = GraphRenderer.Text;
        AppContext.ctx.fillText(AppContext.prices.centerPrice.inRender.toFixed(digits), 0, AppContext.screenSettings.canvasCenter - 5);
    }

    public static renderDates() {
        let i = dateGridOffset;

        let microsecondsOffset = 0;

        while (i < AppContext.canvas.width) {
            let date = new Date(AppContext.prices.minMaxPrice.minDate + microsecondsOffset);
            AppContext.ctx.fillText(date.toLocaleTimeString(), i, AppContext.canvas.height - 10);
            i += dateGridStep;

            microsecondsOffset += dateGridStep * 1000;
        }
    }

    public static renderChartLines() {

        let x: number = undefined;
        let y: number = undefined;
        let last: IBidAsk;

        AppContext.ctx.font = "14px Arial";
        AppContext.ctx.fillText("Max: " + AppContext.prices.minMaxPrice.max, 0, 20);
        AppContext.ctx.fillText("Min: " + AppContext.prices.minMaxPrice.min, 0, 35);

        AppContext.ctx.strokeStyle = GraphRenderer.Chart;
        AppContext.ctx.lineWidth = 2;

        let prevX: number;
        AppContext.ctx.beginPath();
        adjustChartRatePixel(AppContext.prices.centerPrice);
        for (let a of AppContext.prices.history) {
            x = getXFromDate(a.timestamp);
            adjustChartRatePixel(a.toRender);

            y = getYFromPrice(a.toRender.inRender);

            if (!prevX) {
                AppContext.ctx.moveTo(x, y);
            }
            else {
                AppContext.ctx.lineTo(x, y);
            }

            last = a;
            prevX = x;
        }

        if (AppContext.serverTime) {
            x = getXFromDate(AppContext.serverTime);
            AppContext.ctx.lineTo(x, y);
        }


        AppContext.ctx.stroke();
        AppContext.ctx.fillText(last.ask.toFixed(digits), x, AppContext.screenSettings.canvasCenter - 20);
    }

}

function adjustChartRatePixel(data: IAnimationRateData) {
    if (data.inRender > data.required) {
        let pips = Utils.Pips(data.inRender, data.required, multiplier, digits);
        data.inRender = Utils.addPips(data.inRender, -adjustAnimationPips(pips), multiplier);
    }

    if (data.inRender < data.required) {
        let pips = Utils.Pips(data.required, data.inRender, multiplier, digits);
        data.inRender = Utils.addPips(data.inRender, adjustAnimationPips(pips), multiplier);
    }
}

function adjustAnimationPips(pips: number): number {

    if (pips > 0) {
        if (pips > 10) {
            return 10;
        }

        return 1;
    }

    if (pips < -10) {
        return -10;
    }

    return -1;

}


function getXFromDate(date: number): number {
    let secondsDifference = (date - AppContext.prices.minMaxPrice.minDate) / 1000;
    return dateGridOffset + secondsDifference;
}

function getYFromPrice(price: number): number {
    let pips = Utils.Pips(AppContext.prices.centerPrice.inRender, price, multiplier, digits);
    return AppContext.screenSettings.canvasCenter - pips;
}