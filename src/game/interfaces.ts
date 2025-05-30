export interface Vector2D {
	x: number;
	y: number;
}

export interface Drawable {
	draw(ctx: CanvasRenderingContext2D): void;
}

export interface Updatable {
	update(deltaTime: number): void;
}

export interface Collidable {
	position: Vector2D;
	radius: number; // 円形の衝突判定を想定
	isColliding(other: Collidable): boolean;
}

export interface IGameObject extends Drawable, Updatable {
	id: string; // ユニークなID
	isActive: boolean; // アクティブ状態（描画・更新対象か）
}

export const GameState = {
	Playing: 0,
	GameOver: 1,
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export const BulletType = {
	Player: 0,
	Enemy: 1,
} as const;

export type BulletType = (typeof BulletType)[keyof typeof BulletType];
