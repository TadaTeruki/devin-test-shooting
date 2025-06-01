import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import type { Vector2D } from "../interfaces";
import { GameObject } from "./GameObject";

export class Particle extends GameObject {
	velocity: Vector2D;
	maxLifetime: number;
	currentLifetime: number;
	initialRadius: number;
	initialAlpha: number;

	constructor(
		position: Vector2D,
		radius: number,
		color: string,
		velocity: Vector2D,
		lifetime: number,
	) {
		super(position, radius, color);
		this.velocity = velocity;
		this.maxLifetime = lifetime;
		this.currentLifetime = 0;
		this.initialRadius = radius;
		this.initialAlpha = 1.0;
	}

	update(deltaTime: number): void {
		if (!this.isActive) return;

		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;

		this.currentLifetime += deltaTime * 1000;

		if (this.currentLifetime >= this.maxLifetime) {
			this.isActive = false;
			return;
		}

		const progress = this.currentLifetime / this.maxLifetime;
		this.radius = this.initialRadius * (1 - progress);

		if (
			this.position.x < -this.radius ||
			this.position.x > CANVAS_WIDTH + this.radius ||
			this.position.y < -this.radius ||
			this.position.y > CANVAS_HEIGHT + this.radius
		) {
			this.isActive = false;
		}
	}

	draw(ctx: CanvasRenderingContext2D): void {
		if (!this.isActive) return;

		const progress = this.currentLifetime / this.maxLifetime;
		const alpha = this.initialAlpha * (1 - progress);

		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
		ctx.restore();
	}
}
