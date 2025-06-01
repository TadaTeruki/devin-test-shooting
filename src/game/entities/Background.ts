import type { Camera } from "../camera/Camera";
import {
	BACKGROUND_BEACH_COLOR,
	BACKGROUND_BEACH_RADIUS_FACTOR,
	BACKGROUND_COLOR_GREEN,
	BACKGROUND_COLOR_LIGHT_GREEN,
	BACKGROUND_GRID_SPACING,
	BACKGROUND_NOISE_SCALE_X,
	BACKGROUND_NOISE_SCALE_Y,
	BACKGROUND_ROAD_COLOR,
	BACKGROUND_ROAD_NOISE_THRESHOLD,
	BACKGROUND_ROAD_RADIUS,
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

	update(_deltaTime: number, _camera?: Camera): void {}

	draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
		this.drawBackgroundNoise(ctx, camera);

		this.drawTrees(ctx, camera);
	}

	private interpolateColor(color1: string, color2: string, t: number): string {
		const hex1 = color1.replace("#", "");
		const hex2 = color2.replace("#", "");

		const r1 = Number.parseInt(hex1.substr(0, 2), 16);
		const g1 = Number.parseInt(hex1.substr(2, 2), 16);
		const b1 = Number.parseInt(hex1.substr(4, 2), 16);

		const r2 = Number.parseInt(hex2.substr(0, 2), 16);
		const g2 = Number.parseInt(hex2.substr(2, 2), 16);
		const b2 = Number.parseInt(hex2.substr(4, 2), 16);

		const r = Math.round(r1 + (r2 - r1) * t);
		const g = Math.round(g1 + (g2 - g1) * t);
		const b = Math.round(b1 + (b2 - b1) * t);

		return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
	}

	/**
	 * パーリンノイズを使用した背景色を描画
	 */
	private drawBackgroundNoise(
		ctx: CanvasRenderingContext2D,
		camera: Camera,
	): void {
		const gridSize = 10; // 背景グリッドのサイズ

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({
			x: CANVAS_WIDTH,
			y: CANVAS_HEIGHT,
		});

		const minGridX = Math.floor(topLeft.x / gridSize);
		const maxGridX = Math.ceil(bottomRight.x / gridSize);
		const minGridY = Math.floor(topLeft.y / gridSize);
		const maxGridY = Math.ceil(bottomRight.y / gridSize);

		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldPos = { x: gridX * gridSize, y: gridY * gridSize };
				const screenPos = camera.worldToScreen(worldPos);

				const noiseValue = this.perlinNoise.noise(
					worldPos.x * BACKGROUND_NOISE_SCALE_X,
					worldPos.y * BACKGROUND_NOISE_SCALE_Y,
				);

				const t = (noiseValue + 1) / 2;
				const backgroundColor = this.interpolateColor(
					BACKGROUND_COLOR_GREEN,
					BACKGROUND_COLOR_LIGHT_GREEN,
					t,
				);

				ctx.fillStyle = backgroundColor;
				ctx.fillRect(screenPos.x, screenPos.y, gridSize + 1, gridSize + 1);
			}
		}
	}

	// 海のノイズ値と半径を計算
	private getSeaNoiseAndRadius(
		worldX: number,
		worldY: number,
	): { noiseValue: number; radius: number } {
		const seaNoiseValue = this.seaPerlinNoise.noise(
			worldX * BACKGROUND_SEA_NOISE_SCALE,
			worldY * BACKGROUND_SEA_NOISE_SCALE,
		);
		const seaRadius =
			BACKGROUND_SEA_RADIUS_MIN +
			seaNoiseValue * (BACKGROUND_SEA_RADIUS_MAX - BACKGROUND_SEA_RADIUS_MIN);
		return { noiseValue: seaNoiseValue, radius: seaRadius };
	}

	// 木のノイズ値と半径を計算
	private getTreeNoiseAndRadius(
		worldX: number,
		worldY: number,
	): { noiseValue: number; radius: number } {
		const treeNoiseValue = this.perlinNoise.noise(
			worldX * BACKGROUND_TREE_NOISE_SCALE,
			worldY * BACKGROUND_TREE_NOISE_SCALE,
		);
		const treeRadius =
			BACKGROUND_TREE_RADIUS_MIN +
			treeNoiseValue *
				(BACKGROUND_TREE_RADIUS_MAX - BACKGROUND_TREE_RADIUS_MIN);
		return { noiseValue: treeNoiseValue, radius: treeRadius };
	}

	// 海が描画可能かどうかを判定
	public isSeaAvailable(worldX: number, worldY: number): boolean {
		const { radius } = this.getSeaNoiseAndRadius(worldX, worldY);
		return radius > BACKGROUND_SEA_RADIUS_VISIBLE;
	}

	// 木が描画可能かどうかを判定
	private isTreeAvailable(worldX: number, worldY: number): boolean {
		if (this.isSeaAvailable(worldX, worldY)) {
			return false; // 海の上には木を描画しない
		}

		const { radius } = this.getTreeNoiseAndRadius(worldX, worldY);
		return radius > BACKGROUND_TREE_RADIUS_VISIBLE;
	}

	// 道路が描画可能かどうかを判定
	private isRoadAvailable(worldX: number, worldY: number): boolean {
		if (this.isSeaAvailable(worldX, worldY)) {
			return false; // 海の上には道路を描画しない
		}

		const { noiseValue } = this.getTreeNoiseAndRadius(worldX, worldY);
		const transformedNoise = Math.abs((noiseValue * 2) - 1);
		return transformedNoise <= BACKGROUND_ROAD_NOISE_THRESHOLD;
	}

	// ビーチの描画
	private drawBeach(
		ctx: CanvasRenderingContext2D,
		camera: Camera,
		minGridX: number,
		maxGridX: number,
		minGridY: number,
		maxGridY: number,
	): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldX = gridX * BACKGROUND_GRID_SPACING;
				const worldY = gridY * BACKGROUND_GRID_SPACING;

				if (!this.isSeaAvailable(worldX, worldY)) continue;

				const { radius: seaRadius } = this.getSeaNoiseAndRadius(worldX, worldY);
				const beachRadius = seaRadius * BACKGROUND_BEACH_RADIUS_FACTOR;

				const screenPos = camera.worldToScreen({ x: worldX, y: worldY });

				if (
					screenPos.x >= -beachRadius &&
					screenPos.x <= CANVAS_WIDTH + beachRadius &&
					screenPos.y >= -beachRadius &&
					screenPos.y <= CANVAS_HEIGHT + beachRadius
				) {
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
	private drawSea(
		ctx: CanvasRenderingContext2D,
		camera: Camera,
		minGridX: number,
		maxGridX: number,
		minGridY: number,
		maxGridY: number,
	): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldX = gridX * BACKGROUND_GRID_SPACING;
				const worldY = gridY * BACKGROUND_GRID_SPACING;

				if (!this.isSeaAvailable(worldX, worldY)) continue;

				const { radius: seaRadius } = this.getSeaNoiseAndRadius(worldX, worldY);

				const screenPos = camera.worldToScreen({ x: worldX, y: worldY });

				if (
					screenPos.x >= -seaRadius &&
					screenPos.x <= CANVAS_WIDTH + seaRadius &&
					screenPos.y >= -seaRadius &&
					screenPos.y <= CANVAS_HEIGHT + seaRadius
				) {
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
	private drawTreeShadow(
		ctx: CanvasRenderingContext2D,
		camera: Camera,
		minGridX: number,
		maxGridX: number,
		minGridY: number,
		maxGridY: number,
	): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldX = gridX * BACKGROUND_GRID_SPACING;
				const worldY = gridY * BACKGROUND_GRID_SPACING;

				if (!this.isTreeAvailable(worldX, worldY)) continue;

				const { radius: treeRadius } = this.getTreeNoiseAndRadius(
					worldX,
					worldY,
				);

				const screenPos = camera.worldToScreen({ x: worldX, y: worldY });

				if (
					screenPos.x >= -treeRadius &&
					screenPos.x <= CANVAS_WIDTH + treeRadius &&
					screenPos.y >= -treeRadius &&
					screenPos.y <= CANVAS_HEIGHT + treeRadius
				) {
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

	private drawRoad(
		ctx: CanvasRenderingContext2D,
		camera: Camera,
		minGridX: number,
		maxGridX: number,
		minGridY: number,
		maxGridY: number,
	): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldX = gridX * BACKGROUND_GRID_SPACING;
				const worldY = gridY * BACKGROUND_GRID_SPACING;

				if (!this.isRoadAvailable(worldX, worldY)) continue;

				const screenPos = camera.worldToScreen({ x: worldX, y: worldY });

				if (
					screenPos.x >= -BACKGROUND_ROAD_RADIUS &&
					screenPos.x <= CANVAS_WIDTH + BACKGROUND_ROAD_RADIUS &&
					screenPos.y >= -BACKGROUND_ROAD_RADIUS &&
					screenPos.y <= CANVAS_HEIGHT + BACKGROUND_ROAD_RADIUS
				) {
					ctx.beginPath();
					ctx.arc(
						screenPos.x,
						screenPos.y,
						BACKGROUND_ROAD_RADIUS,
						0,
						Math.PI * 2,
					);
					ctx.fillStyle = BACKGROUND_ROAD_COLOR;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}

	// 木の描画
	private drawTree(
		ctx: CanvasRenderingContext2D,
		camera: Camera,
		minGridX: number,
		maxGridX: number,
		minGridY: number,
		maxGridY: number,
	): void {
		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldX = gridX * BACKGROUND_GRID_SPACING;
				const worldY = gridY * BACKGROUND_GRID_SPACING;

				if (!this.isTreeAvailable(worldX, worldY)) continue;

				const { radius: treeRadius } = this.getTreeNoiseAndRadius(
					worldX,
					worldY,
				);

				const screenPos = camera.worldToScreen({ x: worldX, y: worldY });

				if (
					screenPos.x >= -treeRadius &&
					screenPos.x <= CANVAS_WIDTH + treeRadius &&
					screenPos.y >= -treeRadius &&
					screenPos.y <= CANVAS_HEIGHT + treeRadius
				) {
					ctx.beginPath();
					ctx.arc(screenPos.x, screenPos.y, treeRadius, 0, Math.PI * 2);
					ctx.fillStyle = BACKGROUND_TREE_COLOR;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}

	private drawTrees(ctx: CanvasRenderingContext2D, camera: Camera): void {
		const gridSpacing = BACKGROUND_GRID_SPACING;

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({
			x: CANVAS_WIDTH,
			y: CANVAS_HEIGHT,
		});

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

		this.drawRoad(ctx, camera, minGridX, maxGridX, minGridY, maxGridY);

		// 木の影の描画
		this.drawTreeShadow(ctx, camera, minGridX, maxGridX, minGridY, maxGridY);

		// 木の描画
		this.drawTree(ctx, camera, minGridX, maxGridX, minGridY, maxGridY);
	}
}
