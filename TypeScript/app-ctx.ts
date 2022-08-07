import { io } from "socket.io-client";
import { Prices } from "./prices";

export interface IScreenSettings {
    canvasWidth: number;
    canvasHeight: number;
    canvasCenter: number;
    dpr: number;
}

export class AppContext {
    public static socket = io();
    public static screenSettings: IScreenSettings = undefined;
    public static canvas: HTMLCanvasElement;
    public static ctx: CanvasRenderingContext2D;
    public static prices = new Prices();
    public static serverTime: number = undefined;
}
