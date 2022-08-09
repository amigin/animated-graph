
function init() {

    RetinaCanvas.canvas = <HTMLCanvasElement>document.getElementById('the-canvas');
    RetinaCanvas.ctx = RetinaCanvas.canvas.getContext('2d');

    RetinaCanvas.ctx.translate(0.5, 0.5);

}

function resize() {

    let dpr = window.devicePixelRatio;
    let screenSettings: IScreenSettings = {
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight,
        dpr: dpr,
        canvasCenter: undefined,
    }

    RetinaCanvas.canvas.setAttribute('style', 'width:100%; height: ' + screenSettings.canvasHeight + 'px');
    RetinaCanvas.canvas.width = screenSettings.canvasWidth * dpr;
    RetinaCanvas.canvas.height = screenSettings.canvasHeight * dpr;

    screenSettings.canvasCenter = Utils.roundNumber(screenSettings.canvasHeight * 0.5, 0);

    RetinaCanvas.screenSettings = screenSettings;

}

setTimeout(() => {

    init();
    resize();

    executeAnimateFrame();

    RetinaCanvas.canvas.onwheel = function (itm) {
        console.log(itm);

    };

}, 100);


function executeAnimateFrame() {
    if (!RetinaCanvas.screenSettings) {
        resize();
    }


    if (RetinaCanvas.screenSettings) {

        RetinaCanvas.setFillStyle(GraphRenderer.Background);
        RetinaCanvas.ctx.fillRect(0, 0, RetinaCanvas.canvas.width, RetinaCanvas.canvas.height);

        GraphRenderer.renderGrid();
        if (AppContext.prices.minMaxPrice) {
            GraphRenderer.renderPrices();
            GraphRenderer.refreshRequired();
            GraphRenderer.renderDates();
            GraphRenderer.renderChartLines();
        }

        requestAnimationFrame(executeAnimateFrame);
    }
}

function reRender() {
    resize();
}

function updateServerTime(time: number) {
    AppContext.serverTime = time;

    if (AppContext.prices) {
        if (AppContext.prices.minMaxPrice) {
            AppContext.prices.minMaxPrice.maxDate = AppContext.serverTime;
        }
    }

    GraphRenderer.refreshRequired();
}



function updateRate(bidAsk: IBidAsk) {
    AppContext.serverTime = bidAsk.st;
    AppContext.prices.push(bidAsk);

    if (!RetinaCanvas.screenSettings) {
        resize();
    }


    if (!AppContext.prices.prev) {
        AppContext.prices.last.toRender = {
            y: {
                requred: RetinaCanvas.getYCenter(),
                inRender: RetinaCanvas.getYCenter(),

            },
            x: {
                requred: get_right_canvas_x(),
                inRender: get_right_canvas_x(),
            }
        }
    } else {
        AppContext.prices.last.toRender = {
            y: {
                requred: getYFromPrice(AppContext.prices.last.ask, GraphRenderer.xScale),
                inRender: AppContext.prices.prev.toRender.y.inRender,
            },
            x: {
                requred: getXFromDate(AppContext.prices.last.dt, GraphRenderer.yScale),
                inRender: get_right_canvas_x(),
            }
        }
    }

    if (!AppContext.prices.centerPrice) {
        AppContext.prices.centerPrice = {
            rateRequred: AppContext.prices.last.ask,
            rateInRender: AppContext.prices.last.ask,
        }
    }
    else {
        let y = getYFromPrice(AppContext.prices.last.ask, GraphRenderer.xScale);
        if (y < 100 || y > RetinaCanvas.getHeight() - 100) {
            AppContext.prices.centerPrice.rateRequred = AppContext.prices.last.ask;
            GraphRenderer.setXScale(1);
        }

        adjustYScale();
    }
}


function adjustYScale() {
    let xScale = 1;
    while (xScale < 100) {
        let maxY = getYFromPrice(AppContext.prices.minMaxPrice.max, xScale);
        let minY = getYFromPrice(AppContext.prices.minMaxPrice.min, xScale);

        if (minY > 0 && minY < RetinaCanvas.getHeight()) {
            if (maxY > 0 && maxY < RetinaCanvas.getHeight()) {
                break;
            }
        }
        xScale += 1;
    }

    GraphRenderer.setXScale(xScale);
}

window.addEventListener('resize', (event) => {
    resize();
    GraphRenderer.refreshRequired();
});

AppContext.socket = AppContext.socketIoManager.socket("/");

AppContext.socket.on("st", (arg) => {
    updateServerTime(arg);
});


AppContext.socket.on("bid-ask", (arg) => {
    updateRate(arg);
});

