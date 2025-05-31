import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	TITLE_BACKGROUND_COLOR,
	TITLE_PLAYER_IMAGE_X_RATIO,
	TITLE_UI_X_RATIO,
	PLAYER_IMAGE_PATH,
} from "../constants";
import { ImageManager } from "../utils/ImageManager";
import { BaseScene } from "./BaseScene";

export class TitleScene extends BaseScene {
	onStart: () => void;
	startButtonBounds: { x: number; y: number; width: number; height: number };
	playerImage: HTMLImageElement | null;

	constructor(onStart: () => void) {
		super();
		this.onStart = onStart;
		this.playerImage = ImageManager.getInstance().getImage(PLAYER_IMAGE_PATH);

		const uiCenterX = CANVAS_WIDTH * TITLE_UI_X_RATIO;
		this.startButtonBounds = {
			x: uiCenterX - 100,
			y: CANVAS_HEIGHT / 2 + 20,
			width: 200,
			height: 60,
		};

		document.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				console.log("Enter key pressed - starting game");
				this.onStart();
			}
		});
	}

	update(_deltaTime: number): void {}

	draw(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = TITLE_BACKGROUND_COLOR;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

		if (this.playerImage) {
			const playerImageX = CANVAS_WIDTH * TITLE_PLAYER_IMAGE_X_RATIO;
			const playerImageY = CANVAS_HEIGHT / 2;
			const imageSize = 200;
			ctx.drawImage(
				this.playerImage,
				playerImageX - imageSize / 2,
				playerImageY - imageSize / 2,
				imageSize,
				imageSize,
			);
		}

		const uiCenterX = CANVAS_WIDTH * TITLE_UI_X_RATIO;
		ctx.font = "bold 48px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Pevious ペビウス", uiCenterX, CANVAS_HEIGHT / 2 - 50);

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
			CANVAS_WIDTH * TITLE_UI_X_RATIO,
			this.startButtonBounds.y + this.startButtonBounds.height / 2,
		);

		console.log("Button position:", this.startButtonBounds);
	}

	handleMouseMove(_x: number, _y: number): void {}

	handleKeyDown(_key: string): void {}

	handleClick(x: number, y: number): void {
		console.log("TitleScene handleClick", x, y, this.startButtonBounds);

		const expandedBounds = {
			x: this.startButtonBounds.x - 50,
			y: this.startButtonBounds.y - 50,
			width: this.startButtonBounds.width + 100,
			height: this.startButtonBounds.height + 100,
		};

		const isInButtonX =
			x >= expandedBounds.x && x <= expandedBounds.x + expandedBounds.width;
		const isInButtonY =
			y >= expandedBounds.y && y <= expandedBounds.y + expandedBounds.height;

		console.log("Button bounds check:", {
			isInButtonX,
			isInButtonY,
			expandedBounds,
		});

		if (isInButtonX && isInButtonY) {
			console.log("Start button clicked! Calling onStart...");
			this.onStart();
		} else {
			console.log("Click outside button bounds");
		}
	}
}
