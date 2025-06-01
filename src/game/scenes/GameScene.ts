import { Camera } from "../camera/Camera";
import { HighScoreManager } from "../utils/HighScoreManager";
import {
	CANVAS_WIDTH,

	ENEMY_SPAWN_INTERVAL,
	ENEMY_NORMAL_COLOR,
	ENEMY_FAST_COLOR,
	ENEMY_HEAVY_COLOR,
	ENEMY_NORMAL_RADIUS,
	ENEMY_FAST_RADIUS,
	ENEMY_HEAVY_RADIUS,
	KEY_SPACE,
	PLAYER_BULLET_COLOR,
	PLAYER_BULLET_FIRE_INTERVAL,
	PLAYER_BULLET_RADIUS,
	PLAYER_BULLET_SPEED,
	READY_DISPLAY_DURATION,
	SCORE_PER_ENEMY,
	SCORE_DISPLAY_FONT,
	SCORE_DISPLAY_COLOR,
	SCORE_DISPLAY_X,
	SCORE_DISPLAY_Y,
	HIGH_SCORE_DISPLAY_FONT,
	HIGH_SCORE_DISPLAY_COLOR,
	VIEWPORT_CENTER_Y,
	PARTICLE_LIFETIME,
	PARTICLE_COUNT_MIN,
	PARTICLE_COUNT_MAX,
	PARTICLE_SPEED_MIN,
	PARTICLE_SPEED_MAX,
	PARTICLE_RADIUS_MIN,
	PARTICLE_RADIUS_MAX,
	PARTICLE_COLORS,
	LIVES_DISPLAY_X,
	LIVES_DISPLAY_Y,
	LIVES_DISPLAY_SPACING,
} from "../constants";
import { Background } from "../entities/Background";
import { Bullet } from "../entities/Bullet";
import { Cloud } from "../entities/Cloud";
import { Enemy } from "../entities/Enemy";
import { Particle } from "../entities/Particle";
import { Player } from "../entities/Player";
import { BulletType, GameState, EnemyType } from "../interfaces";
import type { Vector2D } from "../interfaces";
import { BaseScene } from "./BaseScene";

export class GameScene extends BaseScene {
	player: Player;
	enemies: Enemy[];
	playerBullets: Bullet[];
	enemyBullets: Bullet[];
	particles: Particle[];
	background: Background;
	cloud: Cloud;
	camera: Camera;
	lastEnemySpawnTime: number;
	score: number;
	lastPlayerBulletTime: number;
	gameState: GameState;
	onGameOver: () => void;
	gameStartTime: number;
	isReady: boolean;
	readyElapsedTime: number;
	readyDuration: number;

	constructor(onGameOver: () => void) {
		super();
		this.player = new Player();
		this.enemies = [];
		this.playerBullets = [];
		this.enemyBullets = [];
		this.particles = [];
		this.background = new Background();
		this.cloud = new Cloud();
		this.camera = new Camera();
		this.lastEnemySpawnTime = 0;
		this.score = 0;
		this.lastPlayerBulletTime = 0;
		this.gameStartTime = Date.now();
		this.gameState = GameState.Playing;
		this.onGameOver = onGameOver;
		this.isReady = false;
		this.readyElapsedTime = 0;
		this.readyDuration = READY_DISPLAY_DURATION;
	}

	update(deltaTime: number): void {
		if (!this.isReady) {
			this.readyElapsedTime += deltaTime;
			if (this.readyElapsedTime >= this.readyDuration) {
				this.isReady = true;
			}
		}

		if (this.gameState !== GameState.Playing) return;

		const currentTime = Date.now();

		this.camera.update(deltaTime);
		this.background.update(deltaTime, this.camera);
		this.cloud.update(deltaTime);

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

		for (const particle of this.particles) {
			particle.update(deltaTime);
		}

		this.checkCollisions();

		this.cleanupInactiveObjects();
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.background.draw(ctx, this.camera);

		if (this.player.shouldRender()) {
			this.player.draw(ctx, this.camera, this.background);
		}

		for (const enemy of this.enemies) {
			enemy.draw(ctx, this.camera, this.background);
		}

		for (const bullet of this.playerBullets) {
			bullet.draw(ctx);
		}

		for (const bullet of this.enemyBullets) {
			bullet.draw(ctx);
		}

		for (const particle of this.particles) {
			particle.draw(ctx);
		}

		this.cloud.draw(ctx, this.camera);

		this.drawLives(ctx);

		ctx.font = SCORE_DISPLAY_FONT;
		ctx.fillStyle = SCORE_DISPLAY_COLOR;
		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillText(
			`SCORE: ${this.score.toString().padStart(6, "0")}`,
			SCORE_DISPLAY_X,
			SCORE_DISPLAY_Y,
		);

		const highScore = HighScoreManager.getHighScore();
		ctx.font = HIGH_SCORE_DISPLAY_FONT;
		ctx.fillStyle = HIGH_SCORE_DISPLAY_COLOR;
		ctx.textAlign = "right";
		ctx.textBaseline = "top";
		ctx.fillText(
			`HIGH SCORE: ${highScore.toString().padStart(6, "0")}`,
			SCORE_DISPLAY_X,
			SCORE_DISPLAY_Y + 30,
		);

		if (!this.isReady) {
			ctx.font = "bold 48px Arial";
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("READY?", CANVAS_WIDTH / 2, VIEWPORT_CENTER_Y);
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



	private spawnEnemy(): void {
		const currentTime = Date.now();
		const difficultyScale = this.getDifficultyScale(currentTime);
		
		const enemyType = this.getRandomEnemyType();
		const radius = this.getRadiusForEnemyType(enemyType, difficultyScale);
		const color = this.getColorForEnemyType(enemyType);

		const position: Vector2D = {
			x: Math.random() * (CANVAS_WIDTH - radius * 2) + radius,
			y: -radius,
		};

		const enemy = new Enemy(
			position,
			radius,
			color,
			this.enemyBullets,
			this.gameStartTime,
			enemyType,
		);
		this.enemies.push(enemy);
	}

	private shootPlayerBullet(): void {
		const currentTime = Date.now();

		if (currentTime - this.lastPlayerBulletTime < PLAYER_BULLET_FIRE_INTERVAL) {
			return;
		}

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
		this.lastPlayerBulletTime = currentTime;
	}

	private checkCollisions(): void {
		if (this.player.canCollide()) {
			for (const enemy of this.enemies) {
				if (enemy.isActive && this.player.isColliding(enemy)) {
					this.spawnExplosionParticles(this.player.position);
					const isGameOver = this.player.takeDamage();
					if (isGameOver) {
						this.gameOver();
					}
					return;
				}
			}

			for (const bullet of this.enemyBullets) {
				if (bullet.isActive && this.player.isColliding(bullet)) {
					this.spawnExplosionParticles(this.player.position);
					bullet.isActive = false;
					const isGameOver = this.player.takeDamage();
					if (isGameOver) {
						this.gameOver();
					}
					return;
				}
			}
		}

		for (const bullet of this.playerBullets) {
			if (!bullet.isActive) continue;

			for (const enemy of this.enemies) {
				if (!enemy.isActive) continue;

				if (bullet.isColliding(enemy)) {
					bullet.isActive = false;
					const isDestroyed = enemy.takeDamage();
					if (isDestroyed) {
						this.spawnExplosionParticles(enemy.position);
						enemy.isActive = false;
						this.score += SCORE_PER_ENEMY;
					}
					break;
				}
			}
		}
	}

	private cleanupInactiveObjects(): void {
		this.enemies = this.enemies.filter((enemy) => enemy.isActive);
		this.playerBullets = this.playerBullets.filter((bullet) => bullet.isActive);
		this.enemyBullets = this.enemyBullets.filter((bullet) => bullet.isActive);
		this.particles = this.particles.filter((particle) => particle.isActive);
	}

	private getRandomEnemyType(): EnemyType {
		const rand = Math.random();
		if (rand < 0.1) {
			return EnemyType.Heavy;
		} else if (rand < 0.55) {
			return EnemyType.Fast;
		} else {
			return EnemyType.Normal;
		}
	}

	private getRadiusForEnemyType(type: EnemyType, difficultyScale: number): number {
		let baseRadius: number;
		switch (type) {
			case EnemyType.Normal: baseRadius = ENEMY_NORMAL_RADIUS; break;
			case EnemyType.Fast: baseRadius = ENEMY_FAST_RADIUS; break;
			case EnemyType.Heavy: baseRadius = ENEMY_HEAVY_RADIUS; break;
			default: baseRadius = ENEMY_NORMAL_RADIUS;
		}
		return baseRadius * (1 + difficultyScale * 0.5);
	}

	private getColorForEnemyType(type: EnemyType): string {
		switch (type) {
			case EnemyType.Normal: return ENEMY_NORMAL_COLOR;
			case EnemyType.Fast: return ENEMY_FAST_COLOR;
			case EnemyType.Heavy: return ENEMY_HEAVY_COLOR;
			default: return ENEMY_NORMAL_COLOR;
		}
	}

	private spawnExplosionParticles(position: Vector2D): void {
		const particleCount = PARTICLE_COUNT_MIN + 
			Math.floor(Math.random() * (PARTICLE_COUNT_MAX - PARTICLE_COUNT_MIN + 1));

		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
			const speed = PARTICLE_SPEED_MIN + Math.random() * (PARTICLE_SPEED_MAX - PARTICLE_SPEED_MIN);
			const radius = PARTICLE_RADIUS_MIN + Math.random() * (PARTICLE_RADIUS_MAX - PARTICLE_RADIUS_MIN);
			const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];

			const velocity: Vector2D = {
				x: Math.cos(angle) * speed,
				y: Math.sin(angle) * speed,
			};

			const particle = new Particle(
				{ x: position.x, y: position.y },
				radius,
				color,
				velocity,
				PARTICLE_LIFETIME,
			);

			this.particles.push(particle);
		}
	}

	private drawLives(ctx: CanvasRenderingContext2D): void {
		for (let i = 0; i < this.player.lives; i++) {
			const x = LIVES_DISPLAY_X + i * LIVES_DISPLAY_SPACING;
			const y = LIVES_DISPLAY_Y;
			
			if (this.player.image && this.player.imageLoaded) {
				ctx.drawImage(
					this.player.image,
					x - this.player.radius,
					y - this.player.radius,
					this.player.radius * 2,
					this.player.radius * 2,
				);
			} else {
				ctx.beginPath();
				ctx.arc(x, y, this.player.radius, 0, Math.PI * 2);
				ctx.fillStyle = this.player.originalColor;
				ctx.fill();
				ctx.closePath();
			}
		}
	}

	private gameOver(): void {
		HighScoreManager.setHighScore(this.score);
		this.gameState = GameState.GameOver;
		this.onGameOver();
	}
}
