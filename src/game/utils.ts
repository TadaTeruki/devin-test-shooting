import type { Collidable } from './interfaces';

export function checkCollision(obj1: Collidable, obj2: Collidable): boolean {
    const dx = obj1.position.x - obj2.position.x;
    const dy = obj1.position.y - obj2.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance < obj1.radius + obj2.radius;
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 9);
}
