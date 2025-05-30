import type { Camera } from "../camera/Camera";
import {
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	PLAYER_COLOR,
	PLAYER_RADIUS,
} from "../constants";
import { GameObject } from "./GameObject";

export class Player extends GameObject {
	constructor() {
		super(
			{ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_RADIUS * 3 },
			PLAYER_RADIUS,
			PLAYER_COLOR,
		);
	}

	update(_deltaTime: number): void {}

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
}
