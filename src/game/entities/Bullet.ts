import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants";
import type { Vector2D } from "../interfaces";
import type { BulletType } from "../interfaces";
import { GameObject } from "./GameObject";

export class Bullet extends GameObject {
	velocity: Vector2D;
	type: BulletType;

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
	}

	update(deltaTime: number): void {
		if (!this.isActive) return;

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
}
