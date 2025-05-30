import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	ENEMY_BULLET_COLOR,
	ENEMY_BULLET_RADIUS,
	ENEMY_BULLET_SPEED,
	ENEMY_RADIUS,
	ENEMY_SHOOT_INTERVAL,
	ENEMY_SPEED,
} from "../constants";
import type { Vector2D } from "../interfaces";
import { BulletType } from "../interfaces";
import { Bullet } from "./Bullet";
import { GameObject } from "./GameObject";

export class Enemy extends GameObject {
	velocity: Vector2D;
	lastShootTime: number;
	bullets: Bullet[];
	gameStartTime: number;

	constructor(
		position: Vector2D,
		radius: number,
		color: string,
		bullets: Bullet[],
		gameStartTime: number,
	) {
		super(position, radius, color);

		this.velocity = {
			x: (Math.random() - 0.5) * ENEMY_SPEED,
			y: Math.random() * ENEMY_SPEED * 0.5 + ENEMY_SPEED * 0.3, // 下向きの速度
		};

		this.lastShootTime = 0;
		this.bullets = bullets;
		this.gameStartTime = gameStartTime;
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
	}

	private getDifficultyScale(currentTime: number): number {
		const elapsedSeconds = (currentTime - this.gameStartTime) / 1000;
		const maxScaleTime = 120; // 120秒で最大到達
		return Math.min(elapsedSeconds / maxScaleTime, 1);
	}

	private getShootIntervalScale(): number {
		const difficultyScale = this.getDifficultyScale(Date.now());
		const timeScale = 1.0 - 0.5 * difficultyScale;
		
		const sizeScale = ENEMY_RADIUS / this.radius;
		
		return timeScale * sizeScale;
	}

	shoot(playerPosition: Vector2D, currentTime: number): Bullet | null {
		if (!this.isActive) return null;

		const scaledInterval = ENEMY_SHOOT_INTERVAL * this.getShootIntervalScale();
		
		if (currentTime - this.lastShootTime < scaledInterval) return null;

		this.lastShootTime = currentTime;

		const dx = playerPosition.x - this.position.x;
		const dy = playerPosition.y - this.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		const bulletVelocity: Vector2D = {
			x: (dx / distance) * ENEMY_BULLET_SPEED,
			y: (dy / distance) * ENEMY_BULLET_SPEED,
		};

		const bullet = new Bullet(
			{ x: this.position.x, y: this.position.y },
			ENEMY_BULLET_RADIUS,
			ENEMY_BULLET_COLOR,
			bulletVelocity,
			BulletType.Enemy,
		);
        
        return bullet;
    }
}
