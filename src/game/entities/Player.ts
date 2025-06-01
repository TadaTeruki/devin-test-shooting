import type { Camera } from "../camera/Camera";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	PLAYER_COLOR,
	PLAYER_IMAGE_PATH,
	PLAYER_RADIUS,
	PLAYER_HEALTH,
	PLAYER_DAMAGE_FLASH_DURATION,
	PLAYER_DAMAGE_FLASH_COLOR,
} from "../constants";
import { ImageManager } from "../utils/ImageManager";
import { GameObject } from "./GameObject";

export class Player extends GameObject {
	health: number;
	maxHealth: number;
	damageFlashTime: number;
	originalColor: string;

	constructor() {
		super(
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_RADIUS * 3 },
			PLAYER_RADIUS,
			PLAYER_COLOR,
		);

		this.maxHealth = PLAYER_HEALTH;
		this.health = this.maxHealth;
		this.damageFlashTime = 0;
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
		if (this.damageFlashTime > 0) {
			this.damageFlashTime -= deltaTime * 1000;
			if (this.damageFlashTime <= 0) {
				this.color = this.originalColor;
			}
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

	public takeDamage(): boolean {
		this.health--;
		
		if (this.maxHealth >= 2 && this.health > 0) {
			this.damageFlashTime = PLAYER_DAMAGE_FLASH_DURATION;
			this.color = PLAYER_DAMAGE_FLASH_COLOR;
		}
		
		return this.health <= 0;
	}
}
