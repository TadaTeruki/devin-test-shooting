import {
	BULLET_AFTERIMAGE_ALPHA_DECAY,
	BULLET_AFTERIMAGE_COUNT,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
} from "../constants";
import type { Vector2D } from "../interfaces";
import type { BulletType } from "../interfaces";
import type { Camera } from "../camera/Camera";
import type { Background } from "./Background";
import { GameObject } from "./GameObject";

export class Bullet extends GameObject {
	velocity: Vector2D;
	type: BulletType;
	positionHistory: Vector2D[];

	constructor(
		position: Vector2D,
		radius: number,
		color: string,
		velocity: Vector2D,
		type: BulletType,
	) {
		super(position, radius, color);
		this.velocity = velocity;
		this.type = type;
		this.positionHistory = [];
		this.hasShadow = true;
	}

	update(deltaTime: number): void {
		if (!this.isActive) return;

		this.positionHistory.push({ x: this.position.x, y: this.position.y });
		if (this.positionHistory.length > BULLET_AFTERIMAGE_COUNT) {
			this.positionHistory.shift();
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

	draw(
		ctx: CanvasRenderingContext2D,
		camera?: Camera,
		background?: Background,
	): void {
		this.drawAfterimages(ctx);
		this.drawShadow(ctx, this.position, background, camera);

		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	private drawAfterimages(ctx: CanvasRenderingContext2D): void {
		for (let i = 0; i < this.positionHistory.length; i++) {
			const pos = this.positionHistory[i];
			const alpha = (i + 1) * BULLET_AFTERIMAGE_ALPHA_DECAY;

			ctx.globalAlpha = alpha;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, this.radius, 0, 2 * Math.PI);
			ctx.fillStyle = this.color;
			ctx.fill();
		}
		ctx.globalAlpha = 1.0;
	}
}
