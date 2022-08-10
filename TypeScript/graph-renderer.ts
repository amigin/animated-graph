
const digits: number = 2;
const multiplier: number = 100;


const gridStep = 100;

const dateGridOffset = 100;
const dateGridStep = 240;

const animationAcceleration = 0.2;

class GraphRenderer {

    public static xScale: number = 1;
    public static dateScale: number = 1;

    public static Background = "black";
    public static Grids = "gray";
    public static Chart = "white";
    public static Text = "white";
    public static ChartFill = "#ffffff30";

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
            let date = new Date(AppContext.prices.minMaxPrice.maxDate - microsecondsOffset / this.dateScale);
            RetinaCanvas.fillText(date.toLocaleTimeString(), i, RetinaCanvas.getHeight() - 10);
            i -= dateGridStep;

            microsecondsOffset += dateGridStep * 1000;
        }
    }

    public static setXScale(xScale: number) {
        this.xScale = xScale;
        this.refreshRequired();
    }
    public static setDateScale(dateScale: number) {
        this.dateScale = dateScale;
        this.refreshRequired();
    }

    public static refreshRequired() {
        for (let a of AppContext.prices.history) {
            a.toRender.y.requred = getYFromPrice(a.ask, this.xScale);
            a.toRender.date.requred = getXFromDate(a.dt, this.dateScale);
        }
    }

    public static renderChartLines() {

        let last: IBidAsk = undefined;

        RetinaCanvas.setFontSize(14);


        let x: number = undefined;
        let y: number = undefined;
        let prevX: number;

        RetinaCanvas.beginPath();
        RetinaCanvas.setFillStyle(this.ChartFill);
        adjustChartRate(AppContext.prices.centerPrice);
        let firstX = undefined;
        for (let a of AppContext.prices.history) {
            adjustXPixel(a.toRender.date);
            adjustYPixel(a.toRender.y);

            x = a.toRender.date.inRender;

            if (!firstX) {
                firstX = x;
            }



            y = a.toRender.y.inRender;

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
        RetinaCanvas.lineTo(get_right_canvas_x(), RetinaCanvas.getHeight());
        RetinaCanvas.lineTo(firstX, RetinaCanvas.getHeight());
        RetinaCanvas.fill();


        RetinaCanvas.setStrokeStyle(this.Chart);

        RetinaCanvas.setLineWidth(3);


        x = undefined;
        y = undefined;
        prevX = undefined;
        RetinaCanvas.beginPath();
        for (let a of AppContext.prices.history) {
            x = a.toRender.date.inRender;
            y = a.toRender.y.inRender;

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
        RetinaCanvas.setLineWidth(0.5);
        RetinaCanvas.fillRect(0, y, RetinaCanvas.getWidth(), 0.5);
        RetinaCanvas.stroke();

        RetinaCanvas.beginPath();
        RetinaCanvas.setFillStyle("white");
        RetinaCanvas.moveTo(RetinaCanvas.getWidth(), y);
        RetinaCanvas.lineTo(RetinaCanvas.getWidth() - 10, y - 10);
        RetinaCanvas.lineTo(RetinaCanvas.getWidth() - 80, y - 10);
        RetinaCanvas.lineTo(RetinaCanvas.getWidth() - 80, y + 10);
        RetinaCanvas.lineTo(RetinaCanvas.getWidth() - 10, y + 10);
        RetinaCanvas.fill();

        RetinaCanvas.setFillStyle("black");
        RetinaCanvas.textBaseLineMiddle();
        RetinaCanvas.fillText(AppContext.prices.last.ask.toFixed(digits), RetinaCanvas.getWidth() - 75, y);


        //    RetinaCanvas.fillText(last.ask.toFixed(digits), x, RetinaCanvas.getYCenter() - 20);
    }

}

function getAccDelta(delta: number): number {
    if (delta > 2) {
        return delta * animationAcceleration;
    }
    else
        if (delta < 2) {
            return delta;
        }

    return 1;

}

function adjustXPixel(data: IAnimationData) {
    if (data.inRender == data.requred) {
        return
    }
    if (Math.abs(data.inRender - data.requred) < 0.1) {
        data.inRender = data.requred;
        return;
    }

    if (data.inRender > data.requred) {
        let delta = data.inRender - data.requred;
        data.inRender -= getAccDelta(delta);
    }
    else
        if (data.inRender < data.requred) {

            let delta = data.requred - data.inRender;
            data.inRender += getAccDelta(delta);
        }

}

function adjustYPixel(data: IAnimationData) {
    if (data.inRender > data.requred) {
        let delta = data.inRender - data.requred;
        data.inRender -= getAccDelta(delta);
    }

    if (data.inRender < data.requred) {

        let delta = data.requred - data.inRender;
        data.inRender += getAccDelta(delta);
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


function getXFromDate(date: number, dateScale: number): number {
    let secondsDifference = (AppContext.prices.minMaxPrice.maxDate - date) / 1000;
    return get_right_canvas_x() - secondsDifference * dateScale;
}


function getYFromPrice(price: number, xScale: number): number {
    let pips = Utils.Pips(AppContext.prices.centerPrice.rateInRender, price, multiplier, digits) / xScale;
    return RetinaCanvas.getYCenter() - pips;
}


function get_right_canvas_x(): number {
    return RetinaCanvas.getWidth() - dateGridOffset;
}