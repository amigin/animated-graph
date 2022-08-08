
const digits: number = 2;
const multiplier: number = 100;


const gridStep = 100;

const dateGridOffset = 100;
const dateGridStep = 240;


class GraphRenderer {

    public static xScale: number = 1;

    public static Background = "white";
    public static Grids = "gray";
    public static Chart = "green";
    public static Text = "Black";

    public static renderGrid() {

        RetinaCanvas.setStrokeStyle(this.Grids);
        RetinaCanvas.setLineWidth(1);
        RetinaCanvas.beginPath();
        RetinaCanvas.moveTo(0, RetinaCanvas.getYCenter());
        RetinaCanvas.lineTo(RetinaCanvas.getWidth(), RetinaCanvas.getYCenter());
        RetinaCanvas.stroke();


        let i = RetinaCanvas.getYCenter() - gridStep;

        let canvasWidth = RetinaCanvas.getWidth();
        while (i > 0) {
            RetinaCanvas.beginPath();
            RetinaCanvas.moveTo(0, i);
            RetinaCanvas.lineTo(canvasWidth, i);
            RetinaCanvas.stroke();
            i -= gridStep;
        }

        i = RetinaCanvas.getYCenter() + gridStep;

        while (i < RetinaCanvas.getHeight()) {
            RetinaCanvas.beginPath();
            RetinaCanvas.moveTo(0, i);
            RetinaCanvas.lineTo(canvasWidth, i);
            RetinaCanvas.stroke();
            i += gridStep;
        }
    }

    public static renderPrices() {
        adjustChartRate(AppContext.prices.centerPrice);
        RetinaCanvas.setFillStyle(GraphRenderer.Text);

        RetinaCanvas.fillText(AppContext.prices.centerPrice.rateInRender.toFixed(digits), 0, RetinaCanvas.getYCenter() - 5);
    }

    public static renderDates() {
        let i = get_right_canvas_x();

        let microsecondsOffset = 0;

        while (i > 0) {
            RetinaCanvas.beginPath();
            RetinaCanvas.moveTo(i, 0);
            RetinaCanvas.lineTo(i, RetinaCanvas.getHeight());
            RetinaCanvas.stroke();
            let date = new Date(AppContext.prices.minMaxPrice.maxDate - microsecondsOffset);
            RetinaCanvas.fillText(date.toLocaleTimeString(), i, RetinaCanvas.getHeight() - 10);
            i -= dateGridStep;

            microsecondsOffset += dateGridStep * 1000;
        }
    }

    public static setXScale(xScale: number) {
        this.xScale = xScale;
        this.refreshRequired();
    }

    public static refreshRequired() {
        for (let a of AppContext.prices.history) {
            a.toRender.yRequred = getYFromPrice(a.ask, this.xScale);
        }
    }

    public static renderChartLines() {

        let x: number = undefined;
        let y: number = undefined;
        let last: IBidAsk;

        RetinaCanvas.setFontSize(14);
        RetinaCanvas.fillText("Max: " + AppContext.prices.minMaxPrice.max, 0, 20);
        RetinaCanvas.fillText("Min: " + AppContext.prices.minMaxPrice.min, 0, 35);

        RetinaCanvas.setStrokeStyle(this.Chart);

        RetinaCanvas.setLineWidth(3);

        let prevX: number;
        RetinaCanvas.beginPath();
        adjustChartRate(AppContext.prices.centerPrice);
        for (let a of AppContext.prices.history) {
            x = getXFromDate(a.dt);
            adjustYPixel(a.toRender);

            y = a.toRender.yInRender;

            if (!prevX) {
                RetinaCanvas.moveTo(x, y);
            }
            else {
                RetinaCanvas.lineTo(x, y);
            }

            last = a;
            prevX = x;
        }


        RetinaCanvas.lineTo(get_right_canvas_x(), y);
        RetinaCanvas.stroke();



        RetinaCanvas.beginPath();
        RetinaCanvas.setLineWidth(2);
        RetinaCanvas.setStrokeStyle("blue");
        RetinaCanvas.lineTo(10, 10);
        RetinaCanvas.moveTo(20, 20);

        RetinaCanvas.stroke();

        //    RetinaCanvas.fillText(last.ask.toFixed(digits), x, RetinaCanvas.getYCenter() - 20);
    }

}

function adjustYPixel(data: IAnimationYData) {
    if (data.yInRender > data.yRequred) {

        let delta = data.yInRender - data.yRequred;
        if (delta > 100) {
            delta = 100;
        }
        else
            if (delta > 10) {
                delta = 10;
            }
            else
                if (delta < 5) {
                    data.yInRender = data.yRequred;
                    return;
                }


        data.yInRender -= delta;
    }

    if (data.yInRender < data.yRequred) {

        let delta = data.yRequred - data.yInRender;
        if (delta > 100) {
            delta = 100;
        }
        else
            if (delta > 10) {
                delta = 10;
            }
            else
                if (delta < 5) {
                    data.yInRender = data.yRequred;
                    return;
                }

        data.yInRender += delta;
    }
}


function adjustChartRate(data: IAnimationRateData) {
    if (data.rateInRender > data.rateRequred) {
        let pips = Utils.Pips(data.rateInRender, data.rateRequred, multiplier, digits);
        data.rateInRender = Utils.addPips(data.rateInRender, -adjustAnimationPips(pips), multiplier);
    }

    if (data.rateInRender < data.rateRequred) {
        let pips = Utils.Pips(data.rateRequred, data.rateInRender, multiplier, digits);
        data.rateInRender = Utils.addPips(data.rateInRender, adjustAnimationPips(pips), multiplier);
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
    let secondsDifference = (AppContext.prices.minMaxPrice.maxDate - date) / 1000;
    return get_right_canvas_x() - secondsDifference;
}

function getYFromPrice(price: number, xScale: number): number {
    let pips = Utils.Pips(AppContext.prices.centerPrice.rateInRender, price, multiplier, digits) / xScale;
    return RetinaCanvas.getYCenter() - pips;
}


function get_right_canvas_x(): number {
    return RetinaCanvas.getWidth() - dateGridOffset;
}