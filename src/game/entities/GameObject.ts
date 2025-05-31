import type { Camera } from "../camera/Camera";
import {
	SHADOW_COLOR,
	SHADOW_OFFSET_X,
	SHADOW_OFFSET_Y,
	SHADOW_OFFSET_TREE_ADJUSTMENT,
} from "../constants";
import type { Collidable, IGameObject, Vector2D } from "../interfaces";
import { generateId } from "../utils";
import type { Background } from "./Background";

export abstract class GameObject implements IGameObject, Collidable {
	id: string;
	position: Vector2D;
	radius: number;
	color: string;
	isActive: boolean;
	image: HTMLImageElement | null = null;
	imageLoaded: boolean = false;
	hasShadow: boolean = false;

	constructor(position: Vector2D, radius: number, color: string) {
		this.id = generateId();
		this.position = position;
		this.radius = radius;
		this.color = color;
		this.isActive = true;
	}

	abstract update(deltaTime: number): void;

	/**
	 * 影を描画する
	 */
	protected drawShadow(
		ctx: CanvasRenderingContext2D,
		position: Vector2D,
		background?: Background,
		camera?: Camera,
	): void {
		if (!this.hasShadow) return;

		let offsetX = SHADOW_OFFSET_X;
		let offsetY = SHADOW_OFFSET_Y;

		if (background) {
			const worldPos = camera ? camera.screenToWorld(position) : position;
			const { noiseValue } = background.getTreeNoiseAndRadius(
				worldPos.x,
				worldPos.y,
			);
			if (noiseValue > 0.3) {
				offsetX += SHADOW_OFFSET_TREE_ADJUSTMENT;
				offsetY += SHADOW_OFFSET_TREE_ADJUSTMENT;
			}
		}

		const shadowX = position.x + offsetX;
		const shadowY = position.y + offsetY;

		const shadowWorldPos = camera
			? camera.screenToWorld({ x: shadowX, y: shadowY })
			: { x: shadowX, y: shadowY };

		let isOverSea = false;
		if (background && camera) {
			isOverSea = background.isSeaAvailable(shadowWorldPos.x, shadowWorldPos.y);
		}

		if (this.image && this.imageLoaded) {
			ctx.save();
			if (isOverSea) {
				ctx.globalAlpha = 0.3;
				ctx.filter = "brightness(0.5)";
			} else {
				ctx.globalAlpha = 0.5;
				ctx.filter = "brightness(0)";
			}
			ctx.drawImage(
				this.image,
				shadowX - this.radius,
				shadowY - this.radius,
				this.radius * 2,
				this.radius * 2,
			);
			ctx.restore();
		} else {
			ctx.beginPath();
			ctx.arc(shadowX, shadowY, this.radius, 0, Math.PI * 2);
			if (isOverSea) {
				console.log("Drawing shadow over sea, using SHADOW_COLOR");
				ctx.fillStyle = SHADOW_COLOR;
			} else {
				ctx.fillStyle = "#000000";
			}
			ctx.fill();
			ctx.closePath();
		}
	}

	draw(
		ctx: CanvasRenderingContext2D,
		camera?: Camera,
		background?: Background,
	): void {
		if (!this.isActive) return;

		this.drawShadow(ctx, this.position, background, camera);

		if (this.image && this.imageLoaded) {
			ctx.drawImage(
				this.image,
				this.position.x - this.radius,
				this.position.y - this.radius,
				this.radius * 2,
				this.radius * 2,
			);
		} else {
			ctx.beginPath();
			ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
			ctx.fillStyle = this.color;
			ctx.fill();
			ctx.closePath();
		}
	}

	isColliding(other: Collidable): boolean {
		if (!this.isActive) return false;

		const dx = this.position.x - other.position.x;
		const dy = this.position.y - other.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		return distance < this.radius + other.radius;
	}
}
