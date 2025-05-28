import type { IGameObject, Collidable, Vector2D } from '../interfaces';
import { generateId } from '../utils';
import type { Camera } from '../camera/Camera';

export abstract class GameObject implements IGameObject, Collidable {
    id: string;
    position: Vector2D;
    radius: number;
    color: string;
    isActive: boolean;

    constructor(position: Vector2D, radius: number, color: string) {
        this.id = generateId();
        this.position = position;
        this.radius = radius;
        this.color = color;
        this.isActive = true;
    }

    abstract update(deltaTime: number): void;

    draw(ctx: CanvasRenderingContext2D, camera?: Camera): void {
        if (!this.isActive) return;

        const position = camera ? camera.worldToScreen(this.position) : this.position;

        ctx.beginPath();
        ctx.arc(position.x, position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    isColliding(other: Collidable): boolean {
        if (!this.isActive) return false;
        
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < this.radius + other.radius;
    }
}
