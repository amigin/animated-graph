class RetinaCanvas {

    public static screenSettings: IScreenSettings = undefined;
    public static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;

    public static setLineWidth(width: number) {
        this.ctx.lineWidth = width * this.screenSettings.dpr;
    }

    public static setFontSize(size: number) {
        size *= this.screenSettings.dpr;
        this.ctx.font = size + "px Arial";
    }

    public static getWidth(): number {
        return this.screenSettings.canvasWidth;
    }

    public static getHeight(): number {
        return this.screenSettings.canvasHeight;
    }

    public static moveTo(x: number, y: number) {
        this.ctx.moveTo(x * this.screenSettings.dpr, y * this.screenSettings.dpr);
    }

    public static lineTo(x: number, y: number) {
        this.ctx.lineTo(x * this.screenSettings.dpr, y * this.screenSettings.dpr);
    }

    public static beginPath() {
        this.ctx.beginPath();
    }

    public static stroke() {
        this.ctx.stroke();
    }

    public static fillText(text: string, x: number, y: number) {
        this.ctx.fillText(text, x * this.screenSettings.dpr, y * this.screenSettings.dpr);
    }

    public static setStrokeStyle(style: string) {
        this.ctx.strokeStyle = style;
    }

    public static setFillStyle(style: string) {
        this.ctx.fillStyle = style;
    }

    public static getYCenter(): number {
        return this.screenSettings.canvasCenter;
    }

    public static fillRect(x: number, y: number, width: number, height: number) {
        this.ctx.rect(x * this.screenSettings.dpr, y * this.screenSettings.dpr, width * this.screenSettings.dpr, height * this.screenSettings.dpr);
    }

}