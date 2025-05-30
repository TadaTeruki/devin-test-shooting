import type { Camera } from "../camera/Camera";
import {
	BACKGROUND_GRID_SPACING,
	BACKGROUND_TREE_COLOR,
	BACKGROUND_TREE_RADIUS_MAX,
	BACKGROUND_TREE_RADIUS_MIN,
	BACKGROUND_TREE_RADIUS_VISIBLE,
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

	draw(ctx: CanvasRenderingContext2D, camera: Camera): void {

		const gridSpacing = BACKGROUND_GRID_SPACING;

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({ x: CANVAS_WIDTH, y: CANVAS_HEIGHT });

		const margin = 0;
		const minLocalX = topLeft.x - margin;
		const maxLocalX = bottomRight.x + margin;
		const minLocalY = topLeft.y - margin;
		const maxLocalY = bottomRight.y + margin;

		const minGridX = Math.floor(minLocalX / gridSpacing);
		const maxGridX = Math.ceil(maxLocalX / gridSpacing);
		const minGridY = Math.floor(minLocalY / gridSpacing);
		const maxGridY = Math.ceil(maxLocalY / gridSpacing);

		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const localX = gridX * gridSpacing;
				const localY = gridY * gridSpacing;

				const worldPos = camera.screenToWorld({ x: localX, y: localY });

				// Use world coordinates as input to Perlin noise
				const noiseValue = this.perlinNoise.noise(worldPos.x * 0.002, worldPos.y * 0.002);
				
				const treeRadius = BACKGROUND_TREE_RADIUS_MIN + noiseValue * (BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN);

				if (treeRadius <= BACKGROUND_TREE_RADIUS_VISIBLE) continue; 

				const screenPos = camera.worldToScreen({ x: localX, y: localY });

				ctx.beginPath();
				ctx.arc(screenPos.x, screenPos.y, treeRadius, 0, Math.PI * 2);
				ctx.fillStyle = BACKGROUND_TREE_COLOR;
				ctx.fill();
				ctx.closePath();
			}
		}
	}
}
