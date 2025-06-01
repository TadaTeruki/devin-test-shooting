import type { Camera } from "../camera/Camera";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	PLAYER_COLOR,
	PLAYER_IMAGE_PATH,
	PLAYER_RADIUS,
	INITIAL_LIVES,
	PLAYER_RESPAWN_TIME,
	PLAYER_INVINCIBILITY_TIME,
} from "../constants";
import { ImageManager } from "../utils/ImageManager";
import { GameObject } from "./GameObject";

export class Player extends GameObject {
	lives: number;
	isInvincible: boolean;
	respawnTimer: number;
	invincibilityTimer: number;
	isBlinking: boolean;
	blinkTimer: number;
	originalColor: string;

	constructor() {
		super(
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_RADIUS * 3 },
			PLAYER_RADIUS,
			PLAYER_COLOR,
		);

		this.lives = INITIAL_LIVES;
		this.isInvincible = false;
		this.respawnTimer = 0;
		this.invincibilityTimer = 0;
		this.isBlinking = false;
		this.blinkTimer = 0;
		this.originalColor = PLAYER_COLOR;
		this.hasShadow = true;

		const imageManager = ImageManager.getInstance();
		imageManager
			.loadImage("player", PLAYER_IMAGE_PATH)
			.then((img) => {
				this.image = img;
				this.imageLoaded = true;
			})
			.catch((error) => {
				console.error("Failed to load player image:", error);
			});
	}

	update(deltaTime: number): void {
		if (this.respawnTimer > 0) {
			this.respawnTimer -= deltaTime * 1000;
			if (this.respawnTimer <= 0) {
				this.respawnTimer = 0;
				this.isInvincible = true;
				this.invincibilityTimer = PLAYER_INVINCIBILITY_TIME;
				this.isBlinking = true;
				this.blinkTimer = 0;
			}
		}

		if (this.invincibilityTimer > 0) {
			this.invincibilityTimer -= deltaTime * 1000;
			if (this.invincibilityTimer <= 0) {
				this.invincibilityTimer = 0;
				this.isInvincible = false;
				this.isBlinking = false;
				this.color = this.originalColor;
			}
		}

		if (this.isBlinking) {
			this.blinkTimer += deltaTime * 1000;
			const blinkInterval = 200;
			const shouldShow = Math.floor(this.blinkTimer / blinkInterval) % 2 === 0;
			this.color = shouldShow ? this.originalColor : "transparent";
		}
	}

	moveToPosition(x: number, y: number, camera?: Camera): void {
		const worldPos = camera ? camera.screenToWorld({ x, y }) : { x, y };
		this.position.x = Math.max(
			this.radius,
			Math.min(CANVAS_WIDTH - this.radius, worldPos.x),
		);
		this.position.y = Math.max(
			this.radius,
			Math.min(CANVAS_HEIGHT - this.radius, worldPos.y),
		);
	}

	takeDamage(): boolean {
		if (this.isInvincible || this.respawnTimer > 0 || this.invincibilityTimer > 0) {
			return false;
		}

		this.lives--;
		
		if (this.lives > 0) {
			this.respawnTimer = PLAYER_RESPAWN_TIME;
			this.isInvincible = true;
			this.invincibilityTimer = 0;
			this.isBlinking = false;
			return false;
		}
		
		return true;
	}

	canCollide(): boolean {
		const canCollide = !this.isInvincible && this.respawnTimer <= 0 && this.invincibilityTimer <= 0;
		return canCollide;
	}

	shouldRender(): boolean {
		return this.respawnTimer <= 0 && this.color !== "transparent";
	}
}
