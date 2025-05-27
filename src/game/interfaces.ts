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

export enum GameState {
    Playing,
    GameOver,
}

export enum BulletType {
    Player,
    Enemy,
}
