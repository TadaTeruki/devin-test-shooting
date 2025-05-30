import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import { BaseScene } from "./BaseScene";

export class TitleScene extends BaseScene {
	onStart: () => void;
	startButtonBounds: { x: number; y: number; width: number; height: number };

	constructor(onStart: () => void) {
		super();
		this.onStart = onStart;

		this.startButtonBounds = {
			x: CANVAS_WIDTH / 2 - 150, // Wider button (300px) for easier clicking
			y: CANVAS_HEIGHT / 2 - 120, // Moved up even more to match actual click position
			width: 300,
			height: 200, // Much taller button to ensure clicks register
		};
	}

	update(_deltaTime: number): void {}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.font = "bold 48px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Pevious ペビウス", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

		ctx.fillStyle = "#4CAF50";
		ctx.fillRect(
			this.startButtonBounds.x,
			this.startButtonBounds.y,
			this.startButtonBounds.width,
			this.startButtonBounds.height,
		);

		ctx.font = "bold 24px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(
			"START",
			CANVAS_WIDTH / 2,
			this.startButtonBounds.y + this.startButtonBounds.height / 2,
		);
	}

	handleMouseMove(_x: number, _y: number): void {}

	handleKeyDown(_key: string): void {}

	handleClick(x: number, y: number): void {
		console.log("TitleScene handleClick", x, y, this.startButtonBounds);

		const isInButtonX =
			x >= this.startButtonBounds.x &&
			x <= this.startButtonBounds.x + this.startButtonBounds.width;
		const isInButtonY =
			y >= this.startButtonBounds.y &&
			y <= this.startButtonBounds.y + this.startButtonBounds.height;

		console.log("Button bounds check:", { isInButtonX, isInButtonY });

		if (isInButtonX && isInButtonY) {
			console.log("Start button clicked! Calling onStart...");
			this.onStart();
		} else {
			console.log("Click outside button bounds");
		}
	}
}
