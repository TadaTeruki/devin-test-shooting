import type { Camera } from "../camera/Camera";
import {
	CLOUD_COLOR_DARK,
	CLOUD_COLOR_LIGHT,
	CLOUD_GRID_SPACING,
	CLOUD_NOISE_SCALE,
	CLOUD_NOISE_THRESHOLD,
	CLOUD_OPACITY,
	CLOUD_RADIUS_MAX,
	CLOUD_RADIUS_MIN,
	CLOUD_RADIUS_VISIBLE,
	CLOUD_SCROLL_SPEED,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
} from "../constants";
import { PerlinNoise } from "../utils/perlin";

export class Cloud {
	perlinNoise: PerlinNoise;
	colorPerlinNoise: PerlinNoise;
	position: { x: number; y: number };

	constructor() {
		this.perlinNoise = new PerlinNoise();
		this.colorPerlinNoise = new PerlinNoise();
		this.position = { x: 0, y: 0 };
	}

	update(deltaTime: number): void {
		this.position.y -= CLOUD_SCROLL_SPEED * deltaTime;
	}

	draw(ctx: CanvasRenderingContext2D, camera: Camera): void {
		this.drawClouds(ctx, camera);
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
		const { noiseValue } = this.getCloudNoiseAndRadius(worldX, worldY);
		return noiseValue > CLOUD_NOISE_THRESHOLD;
	}

	private drawClouds(ctx: CanvasRenderingContext2D, camera: Camera): void {
		const gridSpacing = CLOUD_GRID_SPACING;

		const topLeft = camera.screenToWorld({ x: 0, y: 0 });
		const bottomRight = camera.screenToWorld({
			x: CANVAS_WIDTH,
			y: CANVAS_HEIGHT,
		});

		const cloudTopLeft = {
			x: topLeft.x,
			y: topLeft.y + this.position.y,
		};
		const cloudBottomRight = {
			x: bottomRight.x,
			y: bottomRight.y + this.position.y,
		};

		const margin = gridSpacing * 3;
		const minLocalX = cloudTopLeft.x - margin;
		const maxLocalX = cloudBottomRight.x + margin;
		const minLocalY = cloudTopLeft.y - margin;
		const maxLocalY = cloudBottomRight.y + margin;

		const minGridX = Math.floor(minLocalX / gridSpacing);
		const maxGridX = Math.ceil(maxLocalX / gridSpacing);
		const minGridY = Math.floor(minLocalY / gridSpacing);
		const maxGridY = Math.ceil(maxLocalY / gridSpacing);

		ctx.save();
		ctx.globalAlpha = CLOUD_OPACITY;

		for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
			for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
				const worldX = gridX * gridSpacing;
				const worldY = gridY * gridSpacing;

				if (!this.isCloudAvailable(worldX, worldY)) continue;

				const { radius: cloudRadius } = this.getCloudNoiseAndRadius(
					worldX,
					worldY,
				);

				if (cloudRadius < CLOUD_RADIUS_VISIBLE) continue;

				const cloudWorldPos = {
					x: worldX,
					y: worldY - this.position.y,
				};
				const screenPos = camera.worldToScreen(cloudWorldPos);

				if (
					screenPos.x >= -cloudRadius &&
					screenPos.x <= CANVAS_WIDTH + cloudRadius &&
					screenPos.y >= -cloudRadius &&
					screenPos.y <= CANVAS_HEIGHT + cloudRadius
				) {
					const colorNoiseValue = this.colorPerlinNoise.noise(
						worldX * CLOUD_NOISE_SCALE * 2,
						worldY * CLOUD_NOISE_SCALE * 2,
					);
					const t = (colorNoiseValue + 1) / 2;
					const cloudColor = this.interpolateColor(
						CLOUD_COLOR_DARK,
						CLOUD_COLOR_LIGHT,
						t,
					);

					ctx.beginPath();
					ctx.arc(screenPos.x, screenPos.y, cloudRadius, 0, Math.PI * 2);
					ctx.fillStyle = cloudColor;
					ctx.fill();
					ctx.closePath();
				}
			}
		}

		ctx.restore();
	}
}
