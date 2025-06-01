import { SceneManager } from "./SceneManager";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	ENEMY_IMAGE_PATH,
	ENEMY_FAST_IMAGE_PATH,
	ENEMY_HEAVY_IMAGE_PATH,
	PLAYER_IMAGE_PATH,
	PLAYER_SHOOT_SOUND_PATH,
	ENEMY_SHOOT_SOUND_PATH,
	EXPLOSION_SOUND_PATH,
	PLAYER_DAMAGE_SOUND_PATH,
	ENEMY_SPAWN_SOUND_PATH,
	BUTTON_CLICK_SOUND_PATH,
	BUTTON_SELECT_SOUND_PATH,
	SPECIAL_ATTACK_SOUND_PATH,
	BGM_PATH,
} from "./constants";
import { GameState } from "./interfaces";

import { GameScene } from "./scenes/GameScene";
import { TitleScene } from "./scenes/TitleScene";
import { ImageManager } from "./utils/ImageManager";
import { SoundManager } from "./utils/SoundManager";

export class Game {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	sceneManager: SceneManager;
	gameState: GameState;
	lastFrameTime: number;
	animationFrameId: number | null;

	constructor(canvasId: string) {
		this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
		this.canvas.width = CANVAS_WIDTH;
		this.canvas.height = CANVAS_HEIGHT;

		const context = this.canvas.getContext("2d");
		if (!context) {
			throw new Error("Failed to get 2D context");
		}
		this.ctx = context;

		this.sceneManager = new SceneManager();
		this.gameState = GameState.Playing;
		this.lastFrameTime = 0;
		this.animationFrameId = null;

		this.init();
	}

	init(): void {
		this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
		this.canvas.addEventListener("click", this.handleClick.bind(this));
		window.addEventListener("keydown", this.handleKeyDown.bind(this));

		this.preloadImages();
		this.preloadSounds();
		this.startFromTitle();
	}

	/**
	 * ゲームで使用する画像をプリロード
	 */
	private preloadImages(): Promise<void> {
		const imageManager = ImageManager.getInstance();
		return imageManager.preloadImages([
			{ key: "player", src: PLAYER_IMAGE_PATH },
			{ key: "enemy", src: ENEMY_IMAGE_PATH },
			{ key: "enemy-fast", src: ENEMY_FAST_IMAGE_PATH },
			{ key: "enemy-heavy", src: ENEMY_HEAVY_IMAGE_PATH },
		]);
	}

	private preloadSounds(): Promise<void> {
		const soundManager = SoundManager.getInstance();
		return soundManager.preloadSounds([
			{ key: "player-shoot", src: PLAYER_SHOOT_SOUND_PATH },
			{ key: "enemy-shoot", src: ENEMY_SHOOT_SOUND_PATH },
			{ key: "explosion", src: EXPLOSION_SOUND_PATH },
			{ key: "player-damage", src: PLAYER_DAMAGE_SOUND_PATH },
			{ key: "enemy-spawn", src: ENEMY_SPAWN_SOUND_PATH },
			{ key: "button-click", src: BUTTON_CLICK_SOUND_PATH },
			{ key: "button-select", src: BUTTON_SELECT_SOUND_PATH },
			{ key: "special-attack", src: SPECIAL_ATTACK_SOUND_PATH },
			{ key: "bgm", src: BGM_PATH },
		]);
	}

	startGame(): void {
		if (this.animationFrameId === null) {
			this.gameLoop(0);
		}
	}

	stopGame(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
	}

	startFromTitle(): void {
		this.gameState = GameState.Title;

		const titleScene = new TitleScene(() => {
			this.resetGame(); // Go directly to GameScene
		});

		this.sceneManager.changeScene(titleScene);
		this.startGame();
	}

	resetGame(): void {
		this.gameState = GameState.Playing;

		const soundManager = SoundManager.getInstance();
		soundManager.playBGM("bgm", 0.2);

		const gameScene = new GameScene(() => {
			this.gameState = GameState.GameOver;
		});

		this.sceneManager.changeScene(gameScene);
	}

	gameLoop(currentTime: number): void {
		const deltaTime = (currentTime - this.lastFrameTime) / 1000;
		this.lastFrameTime = currentTime;

		this.sceneManager.update(deltaTime);

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.sceneManager.draw(this.ctx);

		this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
	}

	private handleMouseMove(event: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		this.sceneManager.handleMouseMove(x, y);
	}

	private handleKeyDown(event: KeyboardEvent): void {
		this.sceneManager.handleKeyDown(event.key);
	}

	private handleClick(event: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;

		console.log("Game handleClick", x, y, this.gameState);
		this.sceneManager.handleClick(x, y);
	}
}
