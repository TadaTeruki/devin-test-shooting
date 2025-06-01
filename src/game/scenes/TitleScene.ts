import { Camera } from "../camera/Camera";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	PLAYER_IMAGE_PATH,
	HIGH_SCORE_DISPLAY_FONT,
	HIGH_SCORE_DISPLAY_COLOR,
	HIGH_SCORE_DISPLAY_X,
	HIGH_SCORE_DISPLAY_Y,

	TITLE_PLAYER_POSITION_RATIO,
	TITLE_UI_Y_RATIO,
	TITLE_FONT,
	TITLE_START_BUTTON_FONT,
	TITLE_CONTROLS_FONT,
	TITLE_OVERLAY_COLOR,
	CONTROL_INSTRUCTIONS,
	CONTROLS_START_Y,
	CONTROLS_LINE_HEIGHT,
} from "../constants";
import { Background } from "../entities/Background";
import { HighScoreManager } from "../utils/HighScoreManager";
import { SoundManager } from "../utils/SoundManager";

import { BaseScene } from "./BaseScene";

export class TitleScene extends BaseScene {
	onStart: () => void;
	startButtonBounds: { x: number; y: number; width: number; height: number };
	playerImage: HTMLImageElement | null;
	background: Background;
	camera: Camera;

	constructor(onStart: () => void) {
		super();
		this.onStart = onStart;
		this.background = new Background();
		this.camera = new Camera();
		this.playerImage = new Image();
		this.playerImage.src = PLAYER_IMAGE_PATH;
		this.playerImage.onload = () => {
			console.log("Player image loaded successfully");
		};

		const soundManager = SoundManager.getInstance();
		soundManager.stopBGM();

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

	update(deltaTime: number): void {
		this.camera.update(deltaTime);
		this.background.update(deltaTime, this.camera);
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.background.draw(ctx, this.camera);
		
		ctx.fillStyle = TITLE_OVERLAY_COLOR;
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
		ctx.font = TITLE_FONT;
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

		ctx.font = TITLE_START_BUTTON_FONT;
		ctx.fillStyle = "#FFFFFF";
		ctx.fillText(
			"START",
			CANVAS_WIDTH / 2,
			this.startButtonBounds.y + this.startButtonBounds.height / 2,
		);

		ctx.font = TITLE_CONTROLS_FONT;
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		
		for (let i = 0; i < CONTROL_INSTRUCTIONS.length; i++) {
			const y = CONTROLS_START_Y + i * CONTROLS_LINE_HEIGHT;
			ctx.fillText(CONTROL_INSTRUCTIONS[i], CANVAS_WIDTH / 2, y);
		}

		const highScore = HighScoreManager.getHighScore();
		ctx.font = HIGH_SCORE_DISPLAY_FONT;
		ctx.fillStyle = HIGH_SCORE_DISPLAY_COLOR;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(
			`High Score: ${highScore.toString().padStart(6, "0")}`,
			HIGH_SCORE_DISPLAY_X,
			HIGH_SCORE_DISPLAY_Y,
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
			const soundManager = SoundManager.getInstance();
			soundManager.playSound("button-click", 0.1);
			this.onStart();
		} else {
			console.log("Click outside button bounds");
		}
	}
}
