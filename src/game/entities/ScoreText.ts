import type { Vector2D } from "../interfaces";

export class ScoreText {
	position: Vector2D;
	velocity: Vector2D;
	text: string;
	color: string;
	fontSize: number;
	lifetime: number;
	maxLifetime: number;
	isActive: boolean;

	constructor(position: Vector2D, score: number, lifetime: number = 500) {
		this.position = { x: position.x, y: position.y };
		this.velocity = { x: 0, y: -50 };
		this.text = `+${score}`;
		this.color = "#FFFF00";
		this.fontSize = 20;
		this.lifetime = lifetime;
		this.maxLifetime = lifetime;
		this.isActive = true;
	}

	update(deltaTime: number): void {
		if (!this.isActive) return;

		this.position.x += this.velocity.x * deltaTime;
		this.position.y += this.velocity.y * deltaTime;

		this.velocity.y *= Math.pow(0.95, deltaTime * 60);

		this.lifetime -= deltaTime * 1000;
		if (this.lifetime <= 0) {
			this.isActive = false;
		}
	}

	draw(ctx: CanvasRenderingContext2D): void {
		if (!this.isActive) return;

		const alpha = Math.max(0, this.lifetime / this.maxLifetime);
		
		ctx.save();
		ctx.font = `bold ${this.fontSize}px Arial`;
		ctx.fillStyle = this.color;
		ctx.globalAlpha = alpha;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(this.text, this.position.x, this.position.y);
		ctx.restore();
	}
}
