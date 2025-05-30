import { GameObject } from './GameObject';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_RADIUS, PLAYER_COLOR } from '../constants';
import type { Camera } from '../camera/Camera';

export class Player extends GameObject {
    constructor() {
        super(
            { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - PLAYER_RADIUS * 3 },
            PLAYER_RADIUS,
            PLAYER_COLOR
        );
    }

    update(_deltaTime: number): void {
    }

    moveToPosition(x: number, y: number, camera?: Camera): void {
        const worldPos = camera ? camera.screenToWorld({ x, y }) : { x, y };
        this.position.x = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, worldPos.x));
        this.position.y = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, worldPos.y));
    }
}
