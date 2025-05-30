import { Camera } from "../camera/Camera";
import {
	CANVAS_WIDTH,
	ENEMY_COLOR,
	ENEMY_RADIUS,
	ENEMY_SPAWN_INTERVAL,
	KEY_SPACE,
	PLAYER_BULLET_COLOR,
	PLAYER_BULLET_RADIUS,
	PLAYER_BULLET_SPEED,
} from "../constants";
import { Background } from "../entities/Background";
import { Bullet } from "../entities/Bullet";
import { Enemy } from "../entities/Enemy";
import { Player } from "../entities/Player";
import { BulletType, GameState } from "../interfaces";
import type { Vector2D } from "../interfaces";
import { BaseScene } from "./BaseScene";

export class GameScene extends BaseScene {
	player: Player;
	enemies: Enemy[];
	playerBullets: Bullet[];
	enemyBullets: Bullet[];
	background: Background;
	camera: Camera;
	lastEnemySpawnTime: number;
	gameState: GameState;
	onGameOver: () => void;
	gameStartTime: number;

	constructor(onGameOver: () => void) {
		super();
		this.player = new Player();
		this.enemies = [];
		this.playerBullets = [];
		this.enemyBullets = [];
		this.background = new Background();
		this.camera = new Camera();
		this.lastEnemySpawnTime = 0;
		this.gameStartTime = Date.now();
		this.gameState = GameState.Playing;
		this.onGameOver = onGameOver;
	}

	update(deltaTime: number): void {
		if (this.gameState !== GameState.Playing) return;

		const currentTime = Date.now();

		this.camera.update(deltaTime);
		this.background.update(deltaTime, this.camera);

		this.player.update(deltaTime);

		if (currentTime - this.lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
			this.spawnEnemy();
			this.lastEnemySpawnTime = currentTime;
		}

		for (const enemy of this.enemies) {
			enemy.update(deltaTime);
			const bullet = enemy.shoot(this.player.position, currentTime);
			if (bullet) {
				this.enemyBullets.push(bullet);
			}
		}

		for (const bullet of this.playerBullets) {
			bullet.update(deltaTime);
		}

		for (const bullet of this.enemyBullets) {
			bullet.update(deltaTime);
		}

		this.checkCollisions();

		this.cleanupInactiveObjects();
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.background.draw(ctx, this.camera);

		this.player.draw(ctx);

		for (const enemy of this.enemies) {
			enemy.draw(ctx);
		}

		for (const bullet of this.playerBullets) {
			bullet.draw(ctx);
		}

		for (const bullet of this.enemyBullets) {
			bullet.draw(ctx);
		}
	}

	handleMouseMove(x: number, y: number): void {
		if (this.gameState !== GameState.Playing) return;
		this.player.moveToPosition(x, y);
	}

	handleKeyDown(key: string): void {
		if (this.gameState !== GameState.Playing) return;

		if (key === KEY_SPACE) {
			this.shootPlayerBullet();
		}
	}

	handleClick(_x: number, _y: number): void {}

	private getDifficultyScale(currentTime: number): number {
		const elapsedSeconds = (currentTime - this.gameStartTime) / 1000;
		const maxScaleTime = 120; // 120秒で最大到達
		return Math.min(elapsedSeconds / maxScaleTime, 1);
	}

	private getEnemyRadiusRange(difficultyScale: number): {
		min: number;
		max: number;
	} {
		const baseRadius = ENEMY_RADIUS;
		return {
			min: baseRadius,
			max: baseRadius * (1 + difficultyScale), // 最大2倍
		};
	}

	private spawnEnemy(): void {
		const currentTime = Date.now();
		const difficultyScale = this.getDifficultyScale(currentTime);
		const radiusRange = this.getEnemyRadiusRange(difficultyScale);

		const radius =
			radiusRange.min + Math.random() * (radiusRange.max - radiusRange.min);

		const position: Vector2D = {
			x: Math.random() * (CANVAS_WIDTH - radius * 2) + radius,
			y: -radius,
		};

		const enemy = new Enemy(
			position,
			radius,
			ENEMY_COLOR,
			this.enemyBullets,
			this.gameStartTime,
		);
		this.enemies.push(enemy);
	}

	private shootPlayerBullet(): void {
		const bulletPosition: Vector2D = {
			x: this.player.position.x,
			y: this.player.position.y - this.player.radius,
		};

		const bulletVelocity: Vector2D = {
			x: 0,
			y: -PLAYER_BULLET_SPEED,
		};

		const bullet = new Bullet(
			bulletPosition,
			PLAYER_BULLET_RADIUS,
			PLAYER_BULLET_COLOR,
			bulletVelocity,
			BulletType.Player,
		);

		this.playerBullets.push(bullet);
	}

	private checkCollisions(): void {
		for (const enemy of this.enemies) {
			if (enemy.isActive && this.player.isColliding(enemy)) {
				this.gameOver();
				return;
			}
		}

		for (const bullet of this.enemyBullets) {
			if (bullet.isActive && this.player.isColliding(bullet)) {
				this.gameOver();
				return;
			}
		}

		for (const bullet of this.playerBullets) {
			if (!bullet.isActive) continue;

			for (const enemy of this.enemies) {
				if (!enemy.isActive) continue;

				if (bullet.isColliding(enemy)) {
					bullet.isActive = false;
					enemy.isActive = false;
					break;
				}
			}
		}
	}

	private cleanupInactiveObjects(): void {
		this.enemies = this.enemies.filter((enemy) => enemy.isActive);
		this.playerBullets = this.playerBullets.filter((bullet) => bullet.isActive);
		this.enemyBullets = this.enemyBullets.filter((bullet) => bullet.isActive);
	}

	private gameOver(): void {
		this.gameState = GameState.GameOver;
		this.onGameOver();
	}
}
