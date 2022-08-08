
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

function updateRate(bidAsk: IBidAsk) {
    AppContext.serverTime = bidAsk.st;
    AppContext.prices.push(bidAsk);

    if (!RetinaCanvas.screenSettings) {
        resize();
    }


    if (!AppContext.prices.prev) {
        AppContext.prices.last.toRender = {
            yRequred: RetinaCanvas.getYCenter(),
            yInRender: RetinaCanvas.getYCenter(),
        }
    } else {
        AppContext.prices.last.toRender = {
            yRequred: getYFromPrice(AppContext.prices.last.ask, GraphRenderer.xScale),
            yInRender: AppContext.prices.prev.toRender.yInRender,
        }
    }

    if (!AppContext.prices.centerPrice) {
        AppContext.prices.centerPrice = {
            rateRequred: AppContext.prices.last.ask,
            rateInRender: AppContext.prices.last.ask,
        }
    }
    else {
        AppContext.prices.centerPrice.rateRequred = AppContext.prices.last.ask;
    }
}


window.addEventListener('resize', (event) => {
    resize();
    GraphRenderer.refreshRequired();
});

AppContext.socket.on("packet", ({ type, data }) => {

    if (type == 2) {

        if (data[0] == "bid-ask") {
            updateRate(data[1]);
        }

        if (data[0] == "st") {
            AppContext.serverTime = data[1];

            if (AppContext.prices) {
                if (AppContext.prices.minMaxPrice) {
                    AppContext.prices.minMaxPrice.maxDate = AppContext.serverTime;
                }
            }
        }
    }

});
