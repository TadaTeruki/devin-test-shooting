export abstract class BaseScene {
	abstract update(deltaTime: number): void;
	abstract draw(ctx: CanvasRenderingContext2D): void;
	abstract handleMouseMove(x: number, y: number): void;
	abstract handleKeyDown(key: string): void;
	abstract handleClick(x: number, y: number): void;
}
