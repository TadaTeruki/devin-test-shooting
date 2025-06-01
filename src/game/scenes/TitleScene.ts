import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	PLAYER_IMAGE_PATH,
	TITLE_BACKGROUND_COLOR,
	TITLE_PLAYER_POSITION_RATIO,
	TITLE_UI_Y_RATIO,
} from "../constants";
import { BaseScene } from "./BaseScene";

export class TitleScene extends BaseScene {
	onStart: () => void;
	startButtonBounds: { x: number; y: number; width: number; height: number };
	playerImage: HTMLImageElement | null;

	constructor(onStart: () => void) {
		super();
		this.onStart = onStart;
		this.playerImage = new Image();
		this.playerImage.src = PLAYER_IMAGE_PATH;
		this.playerImage.onload = () => {
			console.log("Player image loaded successfully");
		};

		const uiCenterY = CANVAS_HEIGHT * TITLE_UI_Y_RATIO;
		this.startButtonBounds = {
			x: CANVAS_WIDTH / 2 - 100,
			y: uiCenterY + 20,
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
			const playerImageX = CANVAS_WIDTH / 2;
			const playerImageY = CANVAS_HEIGHT * TITLE_PLAYER_POSITION_RATIO;
			const imageSize = 200;
			ctx.drawImage(
				this.playerImage,
				playerImageX - imageSize / 2,
				playerImageY - imageSize / 2,
				imageSize,
				imageSize,
			);
		}

		const uiCenterY = CANVAS_HEIGHT * TITLE_UI_Y_RATIO;
		ctx.font = "bold 48px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText("Pevious ペビウス", CANVAS_WIDTH / 2, uiCenterY - 50);

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
