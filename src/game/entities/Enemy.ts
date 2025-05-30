import { GameObject } from './GameObject';
import type { Vector2D } from '../interfaces';
import { BulletType } from '../interfaces';
import { CANVAS_WIDTH, CANVAS_HEIGHT, ENEMY_SPEED, ENEMY_SHOOT_INTERVAL, ENEMY_BULLET_RADIUS, ENEMY_BULLET_COLOR, ENEMY_BULLET_SPEED } from '../constants';
import { Bullet } from './Bullet';

export class Enemy extends GameObject {
    velocity: Vector2D;
    lastShootTime: number;

    constructor(position: Vector2D, radius: number, color: string) {
        super(position, radius, color);
        
        this.velocity = {
            x: (Math.random() - 0.5) * ENEMY_SPEED,
            y: Math.random() * ENEMY_SPEED * 0.5 + ENEMY_SPEED * 0.3 // 下向きの速度
        };
        
        this.lastShootTime = Date.now();
    }

    update(deltaTime: number): void {
        if (!this.isActive) return;

        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;

        if (this.position.x - this.radius < 0 || this.position.x + this.radius > CANVAS_WIDTH) {
            this.velocity.x *= -1;
        }

        if (this.position.y - this.radius > CANVAS_HEIGHT) {
            this.isActive = false;
        }
    }

    shoot(playerPosition: Vector2D, currentTime: number): Bullet | null {
        if (!this.isActive) return null;
        
        if (currentTime - this.lastShootTime < ENEMY_SHOOT_INTERVAL) return null;
        
        this.lastShootTime = currentTime;
        
        const dx = playerPosition.x - this.position.x;
        const dy = playerPosition.y - this.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const bulletVelocity: Vector2D = {
            x: (dx / distance) * ENEMY_BULLET_SPEED,
            y: (dy / distance) * ENEMY_BULLET_SPEED
        };
        
        const bullet = new Bullet(
            { x: this.position.x, y: this.position.y },
            ENEMY_BULLET_RADIUS,
            ENEMY_BULLET_COLOR,
            bulletVelocity,
            BulletType.Enemy
        );
        
        return bullet;
    }
}
