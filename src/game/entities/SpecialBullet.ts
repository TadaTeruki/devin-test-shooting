import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";
import { BulletType } from "../interfaces";
import type { Vector2D } from "../interfaces";
import { SPECIAL_BULLET_HOMING_RATIO_INITIAL, SPECIAL_BULLET_HOMING_RATIO_FINAL, SPECIAL_BULLET_HOMING_DURATION } from "../constants";

export class SpecialBullet extends Bullet {
	targetEnemy: Enemy | null;
	enemies: Enemy[];
	creationTime: number;

	constructor(
		position: Vector2D,
		radius: number,
		color: string,
		velocity: Vector2D,
		enemies: Enemy[]
	) {
		super(position, radius, color, velocity, BulletType.Special);
		this.enemies = enemies;
		this.targetEnemy = this.findNearestEnemy();
		this.creationTime = Date.now();
	}

	update(deltaTime: number): void {
		if (!this.isActive) return;

		if (!this.targetEnemy || !this.targetEnemy.isActive) {
			this.targetEnemy = this.findNearestEnemy();
		}

		if (this.targetEnemy) {
			const elapsedTime = Date.now() - this.creationTime;
			const progress = Math.min(elapsedTime / SPECIAL_BULLET_HOMING_DURATION, 1.0);
			const currentHomingRatio = SPECIAL_BULLET_HOMING_RATIO_INITIAL + 
				(SPECIAL_BULLET_HOMING_RATIO_FINAL - SPECIAL_BULLET_HOMING_RATIO_INITIAL) * progress;

			const dx = this.targetEnemy.position.x - this.position.x;
			const dy = this.targetEnemy.position.y - this.position.y;
			const targetAngle = Math.atan2(dy, dx);
			const currentAngle = Math.atan2(this.velocity.y, this.velocity.x);
			
			let angleDiff = targetAngle - currentAngle;
			while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
			while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
			
			const correctionAngle = currentAngle + angleDiff * currentHomingRatio;
			const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
			
			this.velocity.x = Math.cos(correctionAngle) * speed;
			this.velocity.y = Math.sin(correctionAngle) * speed;
		}

		super.update(deltaTime);
	}

	private findNearestEnemy(): Enemy | null {
		let nearest: Enemy | null = null;
		let minDistance = Infinity;

		for (const enemy of this.enemies) {
			if (!enemy.isActive) continue;
			
			const dx = enemy.position.x - this.position.x;
			const dy = enemy.position.y - this.position.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			if (distance < minDistance) {
				minDistance = distance;
				nearest = enemy;
			}
		}

		return nearest;
	}
}
