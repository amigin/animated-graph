

interface IScreenSettings {
    canvasWidth: number;
    canvasHeight: number;
    canvasCenter: number;
    dpr: number;
}

class AppContext {
    public static socketIoManager = new io.Manager();
    public static socket: any;
    public static prices = new Prices();
    public static serverTime: number = undefined;
}

