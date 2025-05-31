import type { Camera } from "../camera/Camera";
import {
	BACKGROUND_BEACH_COLOR,
	BACKGROUND_BEACH_RADIUS_FACTOR,
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

	constructor() {
		this.perlinNoise = new PerlinNoise();
		this.seaPerlinNoise = new PerlinNoise();
	}

	update(_deltaTime: number, _camera?: Camera): void {
	}

	// 海のノイズ値と半径を計算
	private getSeaNoiseAndRadius(gridX: number, gridY: number): { noiseValue: number; radius: number } {
		const worldPos = { x: gridX * BACKGROUND_GRID_SPACING, y: gridY * BACKGROUND_GRID_SPACING };
		const seaNoiseValue = this.seaPerlinNoise.noise(worldPos.x * BACKGROUND_SEA_NOISE_SCALE, worldPos.y * BACKGROUND_SEA_NOISE_SCALE);
		const seaRadius = BACKGROUND_SEA_RADIUS_MIN + seaNoiseValue * (BACKGROUND_SEA_RADIUS_MAX - BACKGROUND_SEA_RADIUS_MIN);
		return { noiseValue: seaNoiseValue, radius: seaRadius };
	}

	// 木のノイズ値と半径を計算
	private getTreeNoiseAndRadius(gridX: number, gridY: number): { noiseValue: number; radius: number } {
		const worldPos = { x: gridX * BACKGROUND_GRID_SPACING, y: gridY * BACKGROUND_GRID_SPACING };
		const treeNoiseValue = this.perlinNoise.noise(worldPos.x * BACKGROUND_TREE_NOISE_SCALE, worldPos.y * BACKGROUND_TREE_NOISE_SCALE);
		const treeRadius = BACKGROUND_TREE_RADIUS_MIN + treeNoiseValue * (BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN);
		return { noiseValue: treeNoiseValue, radius: treeRadius };
	}

	// 海が描画可能かどうかを判定
	private isSeaAvailable(gridX: number, gridY: number): boolean {
		const { radius } = this.getSeaNoiseAndRadius(gridX, gridY);
		return radius > BACKGROUND_SEA_RADIUS_VISIBLE;
	}

	// 木が描画可能かどうかを判定
	private isTreeAvailable(gridX: number, gridY: number): boolean {
		if (this.isSeaAvailable(gridX, gridY)) {
			return false; // 海の上には木を描画しない
		}

		const { radius } = this.getTreeNoiseAndRadius(gridX, gridY);
		return radius > BACKGROUND_TREE_RADIUS_VISIBLE;
	}

	// ビーチの描画
	private drawBeach(ctx: CanvasRenderingContext2D, camera: Camera, minGridX: number, maxGridX: number, minGridY: number, maxGridY: number): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				if (!this.isSeaAvailable(gridX, gridY)) continue;

				const localX = gridX * BACKGROUND_GRID_SPACING;
				const localY = gridY * BACKGROUND_GRID_SPACING;

				const { radius: seaRadius } = this.getSeaNoiseAndRadius(gridX, gridY);
				const beachRadius = seaRadius * BACKGROUND_BEACH_RADIUS_FACTOR;

				const screenPos = camera.worldToScreen({ x: localX, y: localY });

				if (screenPos.x >= -beachRadius && 
					screenPos.x <= CANVAS_WIDTH + beachRadius && 
					screenPos.y >= -beachRadius && 
					screenPos.y <= CANVAS_HEIGHT + beachRadius) {
					
					ctx.beginPath();
					ctx.arc(screenPos.x, screenPos.y, beachRadius, 0, Math.PI * 2);
					ctx.fillStyle = BACKGROUND_BEACH_COLOR;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}

	// 海の描画
	private drawSea(ctx: CanvasRenderingContext2D, camera: Camera, minGridX: number, maxGridX: number, minGridY: number, maxGridY: number): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				if (!this.isSeaAvailable(gridX, gridY)) continue;

				const localX = gridX * BACKGROUND_GRID_SPACING;
				const localY = gridY * BACKGROUND_GRID_SPACING;

				const { radius: seaRadius } = this.getSeaNoiseAndRadius(gridX, gridY);

				const screenPos = camera.worldToScreen({ x: localX, y: localY });

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

	// 木の影の描画
	private drawTreeShadow(ctx: CanvasRenderingContext2D, camera: Camera, minGridX: number, maxGridX: number, minGridY: number, maxGridY: number): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				if (!this.isTreeAvailable(gridX, gridY)) continue;

				const localX = gridX * BACKGROUND_GRID_SPACING;
				const localY = gridY * BACKGROUND_GRID_SPACING;

				const { radius: treeRadius } = this.getTreeNoiseAndRadius(gridX, gridY);

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
				}
			}
		}
	}

	// 木の描画
	private drawTree(ctx: CanvasRenderingContext2D, camera: Camera, minGridX: number, maxGridX: number, minGridY: number, maxGridY: number): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				if (!this.isTreeAvailable(gridX, gridY)) continue;

				const localX = gridX * BACKGROUND_GRID_SPACING;
				const localY = gridY * BACKGROUND_GRID_SPACING;

				const { radius: treeRadius } = this.getTreeNoiseAndRadius(gridX, gridY);

				const screenPos = camera.worldToScreen({ x: localX, y: localY });

				if (screenPos.x >= -treeRadius && 
					screenPos.x <= CANVAS_WIDTH + treeRadius && 
					screenPos.y >= -treeRadius && 
					screenPos.y <= CANVAS_HEIGHT + treeRadius) {
					
					ctx.beginPath();
					ctx.arc(screenPos.x, screenPos.y, treeRadius, 0, Math.PI * 2);
					ctx.fillStyle = BACKGROUND_TREE_COLOR;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
		const gridSpacing = BACKGROUND_GRID_SPACING;

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({ x: CANVAS_WIDTH, y: CANVAS_HEIGHT });

		const margin = gridSpacing * 3; // マージンを設定して、グリッドの境界を少し広げる
		const minLocalX = topLeft.x - margin;
		const maxLocalX = bottomRight.x + margin;
		const minLocalY = topLeft.y - margin;
		const maxLocalY = bottomRight.y + margin;

		const minGridX = Math.floor(minLocalX / gridSpacing);
		const maxGridX = Math.ceil(maxLocalX / gridSpacing);
		const minGridY = Math.floor(minLocalY / gridSpacing);
		const maxGridY = Math.ceil(maxLocalY / gridSpacing);

		// ビーチの描画
		this.drawBeach(ctx, camera, minGridX, maxGridX, minGridY, maxGridY);

		// 海の描画
		this.drawSea(ctx, camera, minGridX, maxGridX, minGridY, maxGridY);

		// 木の影の描画
		this.drawTreeShadow(ctx, camera, minGridX, maxGridX, minGridY, maxGridY);

		// 木の描画
		this.drawTree(ctx, camera, minGridX, maxGridX, minGridY, maxGridY);
	}
}
