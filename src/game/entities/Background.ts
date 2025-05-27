import { GameObject } from './GameObject';
import type { Vector2D } from '../interfaces';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BACKGROUND_SCROLL_SPEED, BACKGROUND_TREE_COLOR, BACKGROUND_TREE_RADIUS_MIN, BACKGROUND_TREE_RADIUS_MAX } from '../constants';

class Tree extends GameObject {
    speed: number;

    constructor() {
        const radius = Math.random() * (BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN) + BACKGROUND_TREE_RADIUS_MIN;
        const position: Vector2D = {
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT
        };
        
        super(position, radius, BACKGROUND_TREE_COLOR);
        
        this.speed = BACKGROUND_SCROLL_SPEED * (radius / BACKGROUND_TREE_RADIUS_MAX) * 0.5 + BACKGROUND_SCROLL_SPEED * 0.5;
    }

    update(deltaTime: number): void {
        this.position.y += this.speed * deltaTime;
        
        if (this.position.y - this.radius > CANVAS_HEIGHT) {
            this.position.y = -this.radius;
            this.position.x = Math.random() * CANVAS_WIDTH;
        }
    }
}

export class Background {
    trees: Tree[];

    constructor(treeCount: number) {
        this.trees = [];
        
        for (let i = 0; i < treeCount; i++) {
            this.trees.push(new Tree());
        }
    }

    update(deltaTime: number): void {
        for (const tree of this.trees) {
            tree.update(deltaTime);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        for (const tree of this.trees) {
            tree.draw(ctx);
        }
    }
}
