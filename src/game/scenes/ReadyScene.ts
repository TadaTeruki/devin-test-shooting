import { CANVAS_WIDTH, VIEWPORT_CENTER_Y } from "../constants";
import { BaseScene } from "./BaseScene";

export class ReadyScene extends BaseScene {
	onReady: () => void;
	elapsedTime: number;
	readyDuration: number;

	constructor(onReady: () => void) {
		super();
		this.onReady = onReady;
		this.elapsedTime = 0;
		this.readyDuration = 5; // 5 seconds
	}

	update(deltaTime: number): void {
		this.elapsedTime += deltaTime;

		if (this.elapsedTime >= this.readyDuration) {
			console.log("Ready time complete! Starting game...");
			this.onReady();
		}
	}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.font = "bold 48px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("READY?", CANVAS_WIDTH / 2, VIEWPORT_CENTER_Y);
	}

	handleMouseMove(_x: number, _y: number): void {}

	handleKeyDown(_key: string): void {}

	handleClick(_x: number, _y: number): void {}
}
