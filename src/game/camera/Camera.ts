import { BACKGROUND_SCROLL_SPEED } from "../constants";
import type { Vector2D } from "../interfaces";

export class Camera {
	position: Vector2D;
	speed: number;

	constructor() {
		this.position = { x: 0, y: 0 };
		this.speed = BACKGROUND_SCROLL_SPEED;
	}

	update(deltaTime: number): void {
		this.position.y -= this.speed * deltaTime;
	}

	worldToScreen(worldPos: Vector2D): Vector2D {
		return {
			x: worldPos.x,
			y: worldPos.y - this.position.y,
		};
	}

	screenToWorld(screenPos: Vector2D): Vector2D {
		return {
			x: screenPos.x,
			y: screenPos.y + this.position.y,
		};
	}
}
