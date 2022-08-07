

interface IScreenSettings {
    canvasWidth: number;
    canvasHeight: number;
    canvasCenter: number;
    dpr: number;
}

class AppContext {
    public static socket = new io.Manager();
    public static screenSettings: IScreenSettings = undefined;
    public static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;
    public static prices = new Prices();
    public static serverTime: number = undefined;
}


/*
AppContext.socket.on("connect", () => {
    console.log("SocketIO connected");
});

AppContext.socket.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
});


AppContext.socket.on("packet", ({ type, data }) => {
    console.log(`Packet Type: ${type}, Data: ${data}`);
});
*/