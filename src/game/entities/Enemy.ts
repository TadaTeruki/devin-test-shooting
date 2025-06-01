import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	ENEMY_BULLET_COLOR,
	ENEMY_BULLET_RADIUS,
	ENEMY_BULLET_SPEED,
	ENEMY_IMAGE_PATH,
	ENEMY_MAX_SCALE_TIME,
	ENEMY_NORMAL_HEALTH,
	ENEMY_FAST_HEALTH,
	ENEMY_HEAVY_HEALTH,
	ENEMY_NORMAL_SPEED,
	ENEMY_FAST_SPEED,
	ENEMY_HEAVY_SPEED,
	ENEMY_NORMAL_SHOOT_INTERVAL,
	ENEMY_FAST_SHOOT_INTERVAL,
	ENEMY_HEAVY_SHOOT_INTERVAL,
	ENEMY_FAST_IMAGE_PATH,
	ENEMY_HEAVY_IMAGE_PATH,
	ENEMY_HEAVY_BULLET_COLOR,
	ENEMY_DAMAGE_FLASH_DURATION,
	ENEMY_DAMAGE_FLASH_COLOR,
} from "../constants";
import type { Vector2D } from "../interfaces";
import { BulletType, EnemyType } from "../interfaces";
import { ImageManager } from "../utils/ImageManager";
import { SoundManager } from "../utils/SoundManager";
import { Bullet } from "./Bullet";
import { GameObject } from "./GameObject";

export class Enemy extends GameObject {
	velocity: Vector2D;
	lastShootTime: number;
	bullets: Bullet[];
	gameStartTime: number;
	enemyType: EnemyType;
	health: number;
	maxHealth: number;
	damageFlashTime: number;
	originalColor: string;

	constructor(
		position: Vector2D,
		radius: number,
		color: string,
		bullets: Bullet[],
		gameStartTime: number,
		enemyType: EnemyType,
	) {
		super(position, radius, color);

		this.enemyType = enemyType;
		this.maxHealth = this.getHealthForType(enemyType);
		this.health = this.maxHealth;
		this.damageFlashTime = 0;
		this.originalColor = color;

		const speed = this.getSpeedForType(enemyType);
		this.velocity = {
			x: (Math.random() - 0.5) * speed,
			y: Math.random() * speed * 0.5 + speed * 0.3,
		};

		this.lastShootTime = 0;
		this.bullets = bullets;
		this.gameStartTime = gameStartTime;
		this.hasShadow = true;

		const imageManager = ImageManager.getInstance();
		const imagePath = this.getImagePathForType(enemyType);
		const imageKey = this.getImageKeyForType(enemyType);
		
		imageManager
			.loadImage(imageKey, imagePath)
			.then((img) => {
				this.image = img;
				this.imageLoaded = true;
			})
			.catch((error) => {
				console.error(`Failed to load enemy image for type ${enemyType}:`, error);
			});
	}

	update(deltaTime: number): void {
		if (!this.isActive) return;

		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;

		if (
			this.position.x - this.radius < 0 ||
			this.position.x + this.radius > CANVAS_WIDTH
		) {
			this.velocity.x *= -1;
		}

		if (this.position.y - this.radius > CANVAS_HEIGHT) {
			this.isActive = false;
		}

		if (this.damageFlashTime > 0) {
			this.damageFlashTime -= deltaTime * 1000;
			if (this.damageFlashTime <= 0) {
				this.color = this.originalColor;
			}
		}
	}

	private getDifficultyScale(currentTime: number): number {
		const elapsedSeconds = (currentTime - this.gameStartTime) / 1000;
		const maxScaleTime = ENEMY_MAX_SCALE_TIME; // 120秒で最大到達
		return Math.min(elapsedSeconds / maxScaleTime, 1);
	}

	private getShootIntervalScale(): number {
		const difficultyScale = this.getDifficultyScale(Date.now());

		return difficultyScale + 1;
	}

	shoot(playerPosition: Vector2D, currentTime: number): Bullet | null {
		if (!this.isActive) return null;

		const baseInterval = this.getShootIntervalForType(this.enemyType);
		const scaledInterval = baseInterval * this.getShootIntervalScale();

		if (currentTime - this.lastShootTime < scaledInterval) return null;

		this.lastShootTime = currentTime;

		const dx = playerPosition.x - this.position.x;
		const dy = playerPosition.y - this.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		let bulletVelocity: Vector2D;
		
		if (this.enemyType === EnemyType.Heavy) {
			const trackingStrength = 0.3;
			const normalizedDx = dx / distance;
			const normalizedDy = dy / distance;
			
			bulletVelocity = {
				x: normalizedDx * ENEMY_BULLET_SPEED * (1 + trackingStrength),
				y: normalizedDy * ENEMY_BULLET_SPEED * (1 + trackingStrength),
			};
		} else {
			bulletVelocity = {
				x: (dx / distance) * ENEMY_BULLET_SPEED,
				y: (dy / distance) * ENEMY_BULLET_SPEED,
			};
		}

		const bulletColor = this.enemyType === EnemyType.Heavy ? ENEMY_HEAVY_BULLET_COLOR : ENEMY_BULLET_COLOR;

		const bullet = new Bullet(
			{ x: this.position.x, y: this.position.y },
			ENEMY_BULLET_RADIUS,
			bulletColor,
			bulletVelocity,
			BulletType.Enemy,
		);

		const soundManager = SoundManager.getInstance();
		soundManager.playSound("enemy-shoot", 0.05);

		return bullet;
	}

	private getHealthForType(type: EnemyType): number {
		switch (type) {
			case EnemyType.Normal: return ENEMY_NORMAL_HEALTH;
			case EnemyType.Fast: return ENEMY_FAST_HEALTH;
			case EnemyType.Heavy: return ENEMY_HEAVY_HEALTH;
			default: return ENEMY_NORMAL_HEALTH;
		}
	}

	private getSpeedForType(type: EnemyType): number {
		switch (type) {
			case EnemyType.Normal: return ENEMY_NORMAL_SPEED;
			case EnemyType.Fast: return ENEMY_FAST_SPEED;
			case EnemyType.Heavy: return ENEMY_HEAVY_SPEED;
			default: return ENEMY_NORMAL_SPEED;
		}
	}

	private getShootIntervalForType(type: EnemyType): number {
		switch (type) {
			case EnemyType.Normal: return ENEMY_NORMAL_SHOOT_INTERVAL;
			case EnemyType.Fast: return ENEMY_FAST_SHOOT_INTERVAL;
			case EnemyType.Heavy: return ENEMY_HEAVY_SHOOT_INTERVAL;
			default: return ENEMY_NORMAL_SHOOT_INTERVAL;
		}
	}

	private getImagePathForType(type: EnemyType): string {
		switch (type) {
			case EnemyType.Normal: return ENEMY_IMAGE_PATH;
			case EnemyType.Fast: return ENEMY_FAST_IMAGE_PATH;
			case EnemyType.Heavy: return ENEMY_HEAVY_IMAGE_PATH;
			default: return ENEMY_IMAGE_PATH;
		}
	}

	private getImageKeyForType(type: EnemyType): string {
		switch (type) {
			case EnemyType.Normal: return "enemy";
			case EnemyType.Fast: return "enemy-fast";
			case EnemyType.Heavy: return "enemy-heavy";
			default: return "enemy";
		}
	}

	public takeDamage(damage: number = 1): boolean {
		this.health -= damage;
		
		if (this.maxHealth >= 2 && this.health > 0) {
			this.damageFlashTime = ENEMY_DAMAGE_FLASH_DURATION;
			this.color = ENEMY_DAMAGE_FLASH_COLOR;
		}
		
		return this.health <= 0;
	}
}
