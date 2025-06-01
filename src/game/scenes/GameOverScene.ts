import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	GAMEOVER_BACKGROUND_COLOR,
	HIGH_SCORE_DISPLAY_FONT,
	HIGH_SCORE_DISPLAY_COLOR,
	GAMEOVER_HIGH_SCORE_DISPLAY_X,
	GAMEOVER_HIGH_SCORE_DISPLAY_Y,
} from "../constants";
import { HighScoreManager } from "../utils/HighScoreManager";
import { BaseScene } from "./BaseScene";

export class GameOverScene extends BaseScene {
	onRestart: () => void;
	replayButtonBounds: { x: number; y: number; width: number; height: number };

	constructor(onRestart: () => void) {
		super();
		this.onRestart = onRestart;

		this.replayButtonBounds = {
			x: CANVAS_WIDTH / 2 - 100,
			y: CANVAS_HEIGHT / 2 + 20,
			width: 200,
			height: 60,
		};
	}

	update(_deltaTime: number): void {}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = GAMEOVER_BACKGROUND_COLOR;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

		const highScore = HighScoreManager.getHighScore();
		ctx.font = HIGH_SCORE_DISPLAY_FONT;
		ctx.fillStyle = HIGH_SCORE_DISPLAY_COLOR;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(
			`High Score: ${highScore.toString().padStart(6, "0")}`,
			GAMEOVER_HIGH_SCORE_DISPLAY_X,
			GAMEOVER_HIGH_SCORE_DISPLAY_Y,
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
