
function init() {

    AppContext.canvas = <HTMLCanvasElement>document.getElementById('the-canvas');
    AppContext.ctx = AppContext.canvas.getContext('2d');

    AppContext.ctx.translate(0.5, 0.5);

    //AppContext.initSocketIo();


    /*
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/Prices")
        .configureLogging(signalR.LogLevel.Information)
        .build();

    connection.on("bidask", (itm: IBidAsk) => {
        AppContext.prices.push(itm);
        reRender();
    });

    connection.on("time", (itm: IServerTime) => {
        AppContext.serverTime = itm.timestamp;
    });

    connection.start();
    */
}

function resize() {
    let screenSettings: IScreenSettings = {
        canvasWidth: window.innerWidth,
        canvasHeight: window.innerHeight - 10,
        dpr: window.devicePixelRatio,
        canvasCenter: Utils.roundNumber(AppContext.canvas.height * 0.5, 0),
    }

    AppContext.canvas.setAttribute('style', 'width:100%; height: ' + screenSettings.canvasHeight + 'px');
    AppContext.canvas.width = screenSettings.canvasWidth * screenSettings.dpr;
    AppContext.canvas.height = screenSettings.canvasHeight * screenSettings.dpr;

    AppContext.screenSettings = screenSettings;
}

setTimeout(() => {
    console.log("Started");
    init();
    resize();

    executeAnimateFrame();

}, 100);
/*
const socket = io();

socket.on("connect", () => {
    console.log("SocketIO connected");
});

socket.on("disconnect", (reason) => {
    console.log("Disconnected: " + reason);
});

socket.on("data", (itm) => {
    console.log(itm);
});
*/

function executeAnimateFrame() {
    if (!AppContext.screenSettings) {
        resize();
    }

    AppContext.ctx.fillStyle = GraphRenderer.Background;
    AppContext.ctx.fillRect(0, 0, AppContext.canvas.width, AppContext.canvas.height);

    AppContext.ctx.strokeStyle = GraphRenderer.Grids;
    AppContext.ctx.lineWidth = 1;
    AppContext.ctx.beginPath();
    AppContext.ctx.moveTo(0, AppContext.screenSettings.canvasCenter);
    AppContext.ctx.lineTo(AppContext.canvas.width, AppContext.screenSettings.canvasCenter);
    AppContext.ctx.stroke();

    GraphRenderer.renderGrid();
    if (AppContext.prices.minMaxPrice) {
        GraphRenderer.renderPrices();
        GraphRenderer.renderDates();
        GraphRenderer.renderChartLines();
    }

    requestAnimationFrame(executeAnimateFrame);
}

function reRender() {
    resize();
}


window.addEventListener('resize', (event) => {
    resize();
});