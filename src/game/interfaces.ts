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
	Title: 0,
	Ready: 1,
	Playing: 2,
	GameOver: 3,
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];

export const BulletType = {
	Player: 0,
	Enemy: 1,
	Special: 2,
} as const;

export type BulletType = (typeof BulletType)[keyof typeof BulletType];

export const EnemyType = {
	Normal: 0,
	Fast: 1,
	Heavy: 2,
} as const;

export type EnemyType = (typeof EnemyType)[keyof typeof EnemyType];
