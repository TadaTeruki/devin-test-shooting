import { GameObject } from './GameObject';
import type { Vector2D } from '../interfaces';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BACKGROUND_SCROLL_SPEED, BACKGROUND_TREE_COLOR, BACKGROUND_TREE_RADIUS_MIN, BACKGROUND_TREE_RADIUS_MAX } from '../constants';
import { PerlinNoise } from '../utils/perlin';
import type { Camera } from '../camera/Camera';

class Tree extends GameObject {
    speed: number;

    constructor(perlin: PerlinNoise, index: number) {
        const radius = Math.random() * (BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN) + BACKGROUND_TREE_RADIUS_MIN;
        
        const noiseScale = 0.1;
        const noiseX = perlin.noise(index * noiseScale, 0) * CANVAS_WIDTH;
        const noiseY = perlin.noise(0, index * noiseScale) * CANVAS_HEIGHT;
        
        const position: Vector2D = {
            x: noiseX,
            y: noiseY
        };
        
        super(position, radius, BACKGROUND_TREE_COLOR);
        
        this.speed = BACKGROUND_SCROLL_SPEED;
    }

    update(deltaTime: number): void {
        this.position.y += this.speed * deltaTime;
        
        if (this.position.y - this.radius > CANVAS_HEIGHT) {
            this.position.y = -this.radius;
            this.position.x = Math.max(0, Math.min(CANVAS_WIDTH, this.position.x + (Math.random() - 0.5) * 20));
        }
    }
}

export class Background {
    trees: Tree[];
    perlinNoise: PerlinNoise;

    constructor(treeCount: number) {
        this.trees = [];
        this.perlinNoise = new PerlinNoise();
        
        for (let i = 0; i < treeCount; i++) {
            this.trees.push(new Tree(this.perlinNoise, i));
        }
    }

    update(deltaTime: number, camera?: Camera): void {
        for (const tree of this.trees) {
            tree.update(deltaTime);
        }
        
        if (camera) {
            const initialTreeCount = this.trees.length;
            
            this.trees = this.trees.filter(tree => {
                const screenPos = camera.worldToScreen(tree.position);
                return screenPos.y < CANVAS_HEIGHT + tree.radius * 2; // Keep some buffer
            });
            
            const removedTreeCount = initialTreeCount - this.trees.length;
            
            for (let i = 0; i < removedTreeCount; i++) {
                const index = Math.floor(Math.random() * 10000); // Random large index for Perlin noise
                const radius = Math.random() * (BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN) + BACKGROUND_TREE_RADIUS_MIN;
                
                const noiseScale = 0.1;
                const noiseX = this.perlinNoise.noise(index * noiseScale, 0) * CANVAS_WIDTH;
                
                const worldY = camera.position.y - radius;
                
                const newTree = new Tree(this.perlinNoise, index);
                newTree.position.x = noiseX;
                newTree.position.y = worldY;
                
                this.trees.push(newTree);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, camera?: Camera): void {
        for (const tree of this.trees) {
            tree.draw(ctx, camera);
        }
    }
}
