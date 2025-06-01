import { Bullet } from "./Bullet";
import { Enemy } from "./Enemy";
import { BulletType } from "../interfaces";
import type { Vector2D } from "../interfaces";
import { 
	SPECIAL_BULLET_HOMING_RATIO_INITIAL, 
	SPECIAL_BULLET_HOMING_RATIO_FINAL, 
	SPECIAL_BULLET_HOMING_DURATION,
	SPECIAL_BULLET_AFTERIMAGE_COUNT,
	SPECIAL_BULLET_AFTERIMAGE_ALPHA_DECAY,
	SPECIAL_BULLET_RING_BLINK_INTERVAL,
	SPECIAL_BULLET_RING_COLOR,
	CANVAS_WIDTH,
	CANVAS_HEIGHT
} from "../constants";

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

		this.positionHistory.push({ x: this.position.x, y: this.position.y });
		if (this.positionHistory.length > SPECIAL_BULLET_AFTERIMAGE_COUNT) {
			this.positionHistory.shift();
		}

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

		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;

		if (
			this.position.x < -this.radius ||
			this.position.x > CANVAS_WIDTH + this.radius ||
			this.position.y < -this.radius ||
			this.position.y > CANVAS_HEIGHT + this.radius
		) {
			this.isActive = false;
		}
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

	draw(ctx: CanvasRenderingContext2D): void {
		this.drawBlinkingRings(ctx);
		this.drawAfterimages(ctx);
		
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	private drawBlinkingRings(ctx: CanvasRenderingContext2D): void {
		const currentTime = Date.now();
		const blinkCycle = Math.floor(currentTime / SPECIAL_BULLET_RING_BLINK_INTERVAL) % 2;
		const isVisible = blinkCycle === 0;

		if (isVisible) {
			this.drawRingAt(ctx, this.position);
			for (const pos of this.positionHistory) {
				this.drawRingAt(ctx, pos);
			}
		}
	}

	private drawRingAt(ctx: CanvasRenderingContext2D, position: Vector2D): void {
		ctx.beginPath();
		ctx.arc(position.x, position.y, this.radius * 2, 0, 2 * Math.PI);
		ctx.strokeStyle = SPECIAL_BULLET_RING_COLOR;
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	private drawAfterimages(ctx: CanvasRenderingContext2D): void {
		for (let i = 0; i < this.positionHistory.length; i++) {
			const pos = this.positionHistory[i];
			const alpha = (i + 1) * SPECIAL_BULLET_AFTERIMAGE_ALPHA_DECAY;

			ctx.globalAlpha = alpha;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI);
			ctx.fillStyle = this.color;
			ctx.fill();
		}
		ctx.globalAlpha = 1.0;
	}
}
