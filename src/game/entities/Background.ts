import type { Camera } from "../camera/Camera";
import {
	BACKGROUND_GRID_SPACING,
	BACKGROUND_SEA_COLOR,
	BACKGROUND_SEA_NOISE_SCALE,
	BACKGROUND_SEA_RADIUS_MAX,
	BACKGROUND_SEA_RADIUS_MIN,
	BACKGROUND_SEA_RADIUS_VISIBLE,
	BACKGROUND_TREE_COLOR,
	BACKGROUND_TREE_NOISE_SCALE,
	BACKGROUND_TREE_RADIUS_MAX,
	BACKGROUND_TREE_RADIUS_MIN,
	BACKGROUND_TREE_RADIUS_VISIBLE,
	BACKGROUND_TREE_SHADOW_COLOR,
	BACKGROUND_TREE_SHADOW_OFFSET_X,
	BACKGROUND_TREE_SHADOW_OFFSET_Y,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
} from "../constants";
import { PerlinNoise } from "../utils/perlin";

export class Background {
	perlinNoise: PerlinNoise;
	seaPerlinNoise: PerlinNoise;
	seaGridMap: Map<string, boolean>;

	constructor() {
		this.perlinNoise = new PerlinNoise();
		this.seaPerlinNoise = new PerlinNoise();
		this.seaGridMap = new Map<string, boolean>();
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

		this.seaGridMap.clear();

		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const localX = gridX * gridSpacing;
				const localY = gridY * gridSpacing;

				const worldPos = { x: gridX * gridSpacing, y: gridY * gridSpacing };
				
				const seaNoiseValue = this.seaPerlinNoise.noise(worldPos.x * BACKGROUND_SEA_NOISE_SCALE, worldPos.y * BACKGROUND_SEA_NOISE_SCALE);
				
				const seaRadius = BACKGROUND_SEA_RADIUS_MIN + seaNoiseValue * (BACKGROUND_SEA_RADIUS_MAX - BACKGROUND_SEA_RADIUS_MIN);

				const screenPos = camera.worldToScreen({ x: localX, y: localY });

				if (seaRadius > BACKGROUND_SEA_RADIUS_VISIBLE) {
					const gridKey = `${gridX},${gridY}`;
					this.seaGridMap.set(gridKey, true);

					if (screenPos.x >= -seaRadius && 
						screenPos.x <= CANVAS_WIDTH + seaRadius && 
						screenPos.y >= -seaRadius && 
						screenPos.y <= CANVAS_HEIGHT + seaRadius) {
						
						ctx.beginPath();
						ctx.arc(screenPos.x, screenPos.y, seaRadius, 0, Math.PI * 2);
						ctx.fillStyle = BACKGROUND_SEA_COLOR;
						ctx.fill();
						ctx.closePath();
					}
				}
			}
		}

		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const gridKey = `${gridX},${gridY}`;
				if (this.seaGridMap.has(gridKey)) continue;

				const localX = gridX * gridSpacing;
				const localY = gridY * gridSpacing;

				const worldPos = { x: gridX * gridSpacing, y: gridY * gridSpacing };
				
				const treeNoiseValue = this.perlinNoise.noise(worldPos.x * BACKGROUND_TREE_NOISE_SCALE, worldPos.y * BACKGROUND_TREE_NOISE_SCALE);
				
				const treeRadius = BACKGROUND_TREE_RADIUS_MIN + treeNoiseValue * (BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN);

				if (treeRadius <= BACKGROUND_TREE_RADIUS_VISIBLE) continue;

				const screenPos = camera.worldToScreen({ x: localX, y: localY });

				if (screenPos.x >= -treeRadius && 
					screenPos.x <= CANVAS_WIDTH + treeRadius && 
					screenPos.y >= -treeRadius && 
					screenPos.y <= CANVAS_HEIGHT + treeRadius) {
					
					const shadowPosX = screenPos.x + BACKGROUND_TREE_SHADOW_OFFSET_X;
					const shadowPosY = screenPos.y + BACKGROUND_TREE_SHADOW_OFFSET_Y;
					
					ctx.beginPath();
					ctx.arc(shadowPosX, shadowPosY, treeRadius, 0, Math.PI * 2);
					ctx.fillStyle = BACKGROUND_TREE_SHADOW_COLOR;
					ctx.fill();
					ctx.closePath();
					
					ctx.beginPath();
					ctx.arc(screenPos.x, screenPos.y, treeRadius, 0, Math.PI * 2);
					ctx.fillStyle = BACKGROUND_TREE_COLOR;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}
}
