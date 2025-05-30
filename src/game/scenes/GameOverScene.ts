import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import { BaseScene } from "./BaseScene";

export class GameOverScene extends BaseScene {
	onRestart: () => void;
	replayButtonBounds: { x: number; y: number; width: number; height: number };

	constructor(onRestart: () => void) {
		super();
		this.onRestart = onRestart;

		this.replayButtonBounds = {
			x: CANVAS_WIDTH / 2 - 150, // Wider button (300px) for easier clicking
			y: CANVAS_HEIGHT / 2 - 60, // Moved up to match actual click position
			width: 300,
			height: 120, // Taller button to ensure clicks register
		};
	}

	update(_deltaTime: number): void {}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.font = "bold 48px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 50);

		ctx.fillStyle = "#4CAF50";
		ctx.fillRect(
			this.replayButtonBounds.x,
			this.replayButtonBounds.y,
			this.replayButtonBounds.width,
			this.replayButtonBounds.height,
		);

		ctx.font = "bold 24px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(
			"REPLAY",
			CANVAS_WIDTH / 2,
			this.replayButtonBounds.y + this.replayButtonBounds.height / 2,
		);
	}

	handleMouseMove(_x: number, _y: number): void {}

	handleKeyDown(_key: string): void {}

	handleClick(x: number, y: number): void {
		console.log("GameOverScene handleClick", x, y, this.replayButtonBounds);

		const isInButtonX =
			x >= this.replayButtonBounds.x &&
			x <= this.replayButtonBounds.x + this.replayButtonBounds.width;
		const isInButtonY =
			y >= this.replayButtonBounds.y &&
			y <= this.replayButtonBounds.y + this.replayButtonBounds.height;

		console.log("Button bounds check:", { isInButtonX, isInButtonY });

		if (isInButtonX && isInButtonY) {
			console.log("Replay button clicked! Calling onRestart...");
			this.onRestart();
		} else {
			console.log("Click outside button bounds");
		}
	}
}
