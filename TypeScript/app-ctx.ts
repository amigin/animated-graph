

interface IScreenSettings {
    canvasWidth: number;
    canvasHeight: number;
    canvasCenter: number;
    dpr: number;
}

class AppContext {
    public static socket = new io.Manager();
    public static prices = new Prices();
    public static serverTime: number = undefined;
}

