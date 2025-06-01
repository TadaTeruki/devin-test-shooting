import type { Camera } from "../camera/Camera";
import {
	CLOUD_COLOR,
	CLOUD_RADIUS_MIN,
	CLOUD_RADIUS_MAX,
	CLOUD_RADIUS_VISIBLE,
	CLOUD_NOISE_SCALE,
	CLOUD_SCROLL_SPEED,
	CLOUD_SHADOW_COLOR,
	CLOUD_SHADOW_COLOR_SEA,
	CLOUD_SHADOW_OFFSET_X,
	CLOUD_SHADOW_OFFSET_Y,
	CLOUD_GRID_SPACING,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
} from "../constants";
import { PerlinNoise } from "../utils/perlin";
import type { Background } from "./Background";

export class CloudLayer {
	perlinNoise: PerlinNoise;
	position: { x: number; y: number };

	constructor() {
		this.perlinNoise = new PerlinNoise();
		this.position = { x: 0, y: 0 };
	}

	update(deltaTime: number): void {
		this.position.y -= CLOUD_SCROLL_SPEED * deltaTime;
	}

	draw(ctx: CanvasRenderingContext2D, camera: Camera, background: Background): void {
		this.drawCloudShadows(ctx, camera, background);
		this.drawClouds(ctx, camera);
	}

	private getCloudNoiseAndRadius(
		worldX: number,
		worldY: number,
	): { noiseValue: number; radius: number } {
		const cloudNoiseValue = this.perlinNoise.noise(
			worldX * CLOUD_NOISE_SCALE,
			worldY * CLOUD_NOISE_SCALE,
		);
		const cloudRadius =
			CLOUD_RADIUS_MIN +
			cloudNoiseValue * (CLOUD_RADIUS_MAX - CLOUD_RADIUS_MIN);
		return { noiseValue: cloudNoiseValue, radius: cloudRadius };
	}

	private isCloudAvailable(worldX: number, worldY: number): boolean {
		const { radius } = this.getCloudNoiseAndRadius(worldX, worldY);
		return radius > CLOUD_RADIUS_VISIBLE;
	}

	private drawCloudShadows(
		ctx: CanvasRenderingContext2D,
		camera: Camera,
		background: Background,
	): void {
		const gridSpacing = CLOUD_GRID_SPACING;

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({
			x: CANVAS_WIDTH,
			y: CANVAS_HEIGHT,
		});

		const margin = gridSpacing * 3;
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
				const cloudWorldX = gridX * gridSpacing;
				const cloudWorldY = gridY * gridSpacing + this.position.y;

				if (!this.isCloudAvailable(cloudWorldX, cloudWorldY)) continue;

				const { radius: cloudRadius } = this.getCloudNoiseAndRadius(
					cloudWorldX,
					cloudWorldY,
				);

				const shadowWorldX = cloudWorldX + CLOUD_SHADOW_OFFSET_X;
				const shadowWorldY = gridY * gridSpacing + CLOUD_SHADOW_OFFSET_Y;

				const shadowScreenPos = camera.worldToScreen({
					x: shadowWorldX,
					y: shadowWorldY,
				});

				if (
					shadowScreenPos.x >= -cloudRadius &&
					shadowScreenPos.x <= CANVAS_WIDTH + cloudRadius &&
					shadowScreenPos.y >= -cloudRadius &&
					shadowScreenPos.y <= CANVAS_HEIGHT + cloudRadius
				) {
					const isOverSea = background.isSeaAvailable(shadowWorldX, shadowWorldY);
					const shadowColor = isOverSea ? CLOUD_SHADOW_COLOR_SEA : CLOUD_SHADOW_COLOR;

					ctx.beginPath();
					ctx.arc(shadowScreenPos.x, shadowScreenPos.y, cloudRadius, 0, Math.PI * 2);
					ctx.fillStyle = shadowColor;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}

	private drawClouds(ctx: CanvasRenderingContext2D, camera: Camera): void {
		const gridSpacing = CLOUD_GRID_SPACING;

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({
			x: CANVAS_WIDTH,
			y: CANVAS_HEIGHT,
		});

		const margin = gridSpacing * 3;
		const minLocalX = topLeft.x - margin;
		const maxLocalX = bottomRight.x + margin;
		const minLocalY = topLeft.y - margin - this.position.y;
		const maxLocalY = bottomRight.y + margin - this.position.y;

		const minGridX = Math.floor(minLocalX / gridSpacing);
		const maxGridX = Math.ceil(maxLocalX / gridSpacing);
		const minGridY = Math.floor(minLocalY / gridSpacing);
		const maxGridY = Math.ceil(maxLocalY / gridSpacing);

		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const cloudWorldX = gridX * gridSpacing;
				const cloudWorldY = gridY * gridSpacing + this.position.y;

				if (!this.isCloudAvailable(cloudWorldX, cloudWorldY)) continue;

				const { radius: cloudRadius } = this.getCloudNoiseAndRadius(
					cloudWorldX,
					cloudWorldY,
				);

				const cloudScreenPos = camera.worldToScreen({
					x: cloudWorldX,
					y: gridY * gridSpacing,
				});

				if (
					cloudScreenPos.x >= -cloudRadius &&
					cloudScreenPos.x <= CANVAS_WIDTH + cloudRadius &&
					cloudScreenPos.y >= -cloudRadius &&
					cloudScreenPos.y <= CANVAS_HEIGHT + cloudRadius
				) {
					ctx.beginPath();
					ctx.arc(cloudScreenPos.x, cloudScreenPos.y, cloudRadius, 0, Math.PI * 2);
					ctx.fillStyle = CLOUD_COLOR;
					ctx.fill();
					ctx.closePath();
				}
			}
		}
	}
}
