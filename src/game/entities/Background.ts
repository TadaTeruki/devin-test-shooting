import type { Camera } from "../camera/Camera";
import {
	BACKGROUND_GRID_SPACING,
	BACKGROUND_TREE_COLOR,
	BACKGROUND_TREE_RADIUS_MAX,
	BACKGROUND_TREE_RADIUS_MIN,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
} from "../constants";
import { PerlinNoise } from "../utils/perlin";

export class Background {
	perlinNoise: PerlinNoise;

	constructor() {
		this.perlinNoise = new PerlinNoise();
	}

	update(_deltaTime: number, _camera?: Camera): void {
	}

	draw(ctx: CanvasRenderingContext2D, camera?: Camera): void {
		if (!camera) return;

		const gridSpacing = BACKGROUND_GRID_SPACING;

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({ x: CANVAS_WIDTH, y: CANVAS_HEIGHT });

		const margin = 50; // Buffer margin in world units
		const minWorldX = topLeft.x - margin;
		const maxWorldX = bottomRight.x + margin;
		const minWorldY = topLeft.y - margin;
		const maxWorldY = bottomRight.y + margin;

		const minGridX = Math.floor(minWorldX / gridSpacing);
		const maxGridX = Math.ceil(maxWorldX / gridSpacing);
		const minGridY = Math.floor(minWorldY / gridSpacing);
		const maxGridY = Math.ceil(maxWorldY / gridSpacing);

		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldX = gridX * gridSpacing;
				const worldY = gridY * gridSpacing;

				// Use world coordinates as input to Perlin noise
				const noiseValue = this.perlinNoise.noise(worldX * 0.1, worldY * 0.1);
				
				const treeRadius = BACKGROUND_TREE_RADIUS_MIN + 
					(noiseValue + 1) * 0.5 * (BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN);

				const screenPos = camera.worldToScreen({ x: worldX, y: worldY });

				ctx.beginPath();
				ctx.arc(screenPos.x, screenPos.y, treeRadius, 0, Math.PI * 2);
				ctx.fillStyle = BACKGROUND_TREE_COLOR;
				ctx.fill();
				ctx.closePath();
			}
		}
	}
}
