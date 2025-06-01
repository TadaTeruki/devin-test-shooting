import { Camera } from "../camera/Camera";
import { HighScoreManager } from "../utils/HighScoreManager";
import {
	CANVAS_WIDTH,
	CANVAS_HEIGHT,
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
	GAMEOVER_TEXT_Y,
	GAMEOVER_BUTTON_Y,
	GAMEOVER_HIGH_SCORE_DISPLAY_X,
	GAMEOVER_HIGH_SCORE_DISPLAY_Y,
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
	SPECIAL_ATTACK_CHARGE_TIME,
	SPECIAL_ATTACK_KEY,
	SPECIAL_BULLET_COLOR,
	SPECIAL_BULLET_SPEED,
	SPECIAL_GAUGE_WIDTH,
	SPECIAL_GAUGE_HEIGHT,
	SPECIAL_GAUGE_X,
	SPECIAL_GAUGE_Y,
	SPECIAL_GAUGE_BG_COLOR,
	SPECIAL_GAUGE_FILL_COLOR,
	SPECIAL_GAUGE_FLASH_COLOR,
} from "../constants";
import { Background } from "../entities/Background";
import { Bullet } from "../entities/Bullet";
import { Cloud } from "../entities/Cloud";
import { Enemy } from "../entities/Enemy";
import { Particle } from "../entities/Particle";
import { Player } from "../entities/Player";
import { SpecialBullet } from "../entities/SpecialBullet";
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
	specialAttackChargeTime: number;
	specialAttackReady: boolean;
	specialAttackFlashTimer: number;
	specialBullets: SpecialBullet[];
	isGameOverOverlayVisible: boolean;
	gameOverReplayButtonBounds: { x: number; y: number; width: number; height: number };

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
		this.specialAttackChargeTime = 0;
		this.specialAttackReady = false;
		this.specialAttackFlashTimer = 0;
		this.specialBullets = [];
		this.isGameOverOverlayVisible = false;
		this.gameOverReplayButtonBounds = {
			x: CANVAS_WIDTH / 2 - 100,
			y: GAMEOVER_BUTTON_Y,
			width: 200,
			height: 60,
		};
	}

	update(deltaTime: number): void {
		if (!this.isReady) {
			this.readyElapsedTime += deltaTime;
			if (this.readyElapsedTime >= this.readyDuration) {
				this.isReady = true;
			}
		}

		const currentTime = Date.now();

		this.camera.update(deltaTime);
		this.background.update(deltaTime, this.camera);
		this.cloud.update(deltaTime);

		for (const enemy of this.enemies) {
			enemy.update(deltaTime);
			if (this.gameState === GameState.Playing) {
				const bullet = enemy.shoot(this.player.position, currentTime);
				if (bullet) {
					this.enemyBullets.push(bullet);
				}
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

		if (!this.specialAttackReady) {
			this.specialAttackChargeTime += deltaTime * 1000;
			if (this.specialAttackChargeTime >= SPECIAL_ATTACK_CHARGE_TIME) {
				this.specialAttackReady = true;
				this.specialAttackFlashTimer = 0;
			}
		}

		if (this.specialAttackReady) {
			this.specialAttackFlashTimer += deltaTime * 1000;
		}

		for (const bullet of this.specialBullets) {
			bullet.update(deltaTime);
		}

		this.checkCollisions();
		if (this.gameState === GameState.Playing) {
			this.player.update(deltaTime);

			if (currentTime - this.lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
				this.spawnEnemy();
				this.lastEnemySpawnTime = currentTime;
			}

			this.checkCollisions();
		}

		this.cleanupInactiveObjects();
	}

	draw(ctx: CanvasRenderingContext2D): void {
		this.background.draw(ctx, this.camera);

		if (this.player.shouldRender() && !this.isGameOverOverlayVisible) {
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

		for (const bullet of this.specialBullets) {
			bullet.draw(ctx);
		}
		this.cloud.draw(ctx, this.camera);

		this.drawLives(ctx);

		this.drawSpecialGauge(ctx);

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

		if (this.isGameOverOverlayVisible) {
			ctx.fillStyle = "rgba(59, 66, 82, 0.7)";
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

			ctx.font = "bold 48px Arial";
			ctx.fillStyle = "#FFFFFF";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, GAMEOVER_TEXT_Y);

			ctx.fillStyle = "#4CAF50";
			ctx.fillRect(
				this.gameOverReplayButtonBounds.x,
				this.gameOverReplayButtonBounds.y,
				this.gameOverReplayButtonBounds.width,
				this.gameOverReplayButtonBounds.height,
			);

			ctx.font = "bold 24px Arial";
			ctx.fillStyle = "#FFFFFF";
			ctx.fillText(
				"REPLAY",
				CANVAS_WIDTH / 2,
				this.gameOverReplayButtonBounds.y + this.gameOverReplayButtonBounds.height / 2,
			);

			const highScore = HighScoreManager.getHighScore();
			ctx.font = HIGH_SCORE_DISPLAY_FONT;
			ctx.fillStyle = HIGH_SCORE_DISPLAY_COLOR;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(
				`High Score: ${highScore.toString().padStart(6, "0")}`,
				GAMEOVER_HIGH_SCORE_DISPLAY_X,
				GAMEOVER_HIGH_SCORE_DISPLAY_Y,
			);
		}
	}

	handleMouseMove(x: number, y: number): void {
		if (this.gameState !== GameState.Playing || this.isGameOverOverlayVisible) return;
		this.player.moveToPosition(x, y);
	}

	handleKeyDown(key: string): void {
		if (this.gameState !== GameState.Playing || this.isGameOverOverlayVisible) return;

		if (key === KEY_SPACE) {
			this.shootPlayerBullet();
		} else if (key === SPECIAL_ATTACK_KEY && this.specialAttackReady) {
			this.shootSpecialAttack();
		}
	}

	handleClick(x: number, y: number): void {
		if (this.isGameOverOverlayVisible) {
			const isInButtonX =
				x >= this.gameOverReplayButtonBounds.x &&
				x <= this.gameOverReplayButtonBounds.x + this.gameOverReplayButtonBounds.width;
			const isInButtonY =
				y >= this.gameOverReplayButtonBounds.y &&
				y <= this.gameOverReplayButtonBounds.y + this.gameOverReplayButtonBounds.height;

			if (isInButtonX && isInButtonY) {
				this.resetGameState();
			}
		}
	}

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

		for (const bullet of this.specialBullets) {
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
		this.specialBullets = this.specialBullets.filter((bullet) => bullet.isActive);
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

	private shootSpecialAttack(): void {
		this.specialAttackReady = false;
		this.specialAttackChargeTime = 0;
		this.specialAttackFlashTimer = 0;

		for (const enemy of this.enemies) {
			if (!enemy.isActive) continue;

			const bulletPosition: Vector2D = {
				x: this.player.position.x,
				y: this.player.position.y - this.player.radius,
			};

			const bulletVelocity: Vector2D = {
				x: 0,
				y: -SPECIAL_BULLET_SPEED,
			};

			const specialBullet = new SpecialBullet(
				bulletPosition,
				PLAYER_BULLET_RADIUS,
				SPECIAL_BULLET_COLOR,
				bulletVelocity,
				[enemy]
			);

			this.specialBullets.push(specialBullet);
		}
	}

	private drawSpecialGauge(ctx: CanvasRenderingContext2D): void {
		ctx.fillStyle = SPECIAL_GAUGE_BG_COLOR;
		ctx.fillRect(SPECIAL_GAUGE_X, SPECIAL_GAUGE_Y, SPECIAL_GAUGE_WIDTH, SPECIAL_GAUGE_HEIGHT);

		const fillRatio = Math.min(this.specialAttackChargeTime / SPECIAL_ATTACK_CHARGE_TIME, 1);
		const fillWidth = SPECIAL_GAUGE_WIDTH * fillRatio;

		let fillColor = SPECIAL_GAUGE_FILL_COLOR;
		if (this.specialAttackReady) {
			const flashInterval = 500;
			const isFlashing = Math.floor(this.specialAttackFlashTimer / flashInterval) % 2 === 0;
			fillColor = isFlashing ? SPECIAL_GAUGE_FLASH_COLOR : SPECIAL_GAUGE_FILL_COLOR;
		}

		if (fillWidth > 0) {
			ctx.fillStyle = fillColor;
			ctx.fillRect(SPECIAL_GAUGE_X, SPECIAL_GAUGE_Y, fillWidth, SPECIAL_GAUGE_HEIGHT);
		}

		ctx.strokeStyle = "#FFFFFF";
		ctx.lineWidth = 2;
		ctx.strokeRect(SPECIAL_GAUGE_X, SPECIAL_GAUGE_Y, SPECIAL_GAUGE_WIDTH, SPECIAL_GAUGE_HEIGHT);

		ctx.font = "16px Arial";
		ctx.fillStyle = "#FFFFFF";
		ctx.textAlign = "center";
		ctx.textBaseline = "bottom";
		ctx.fillText("SPECIAL [Press P Key]", SPECIAL_GAUGE_X + SPECIAL_GAUGE_WIDTH / 2, SPECIAL_GAUGE_Y - 5);
	}

	private gameOver(): void {
		HighScoreManager.setHighScore(this.score);
		this.gameState = GameState.GameOver;
		this.isGameOverOverlayVisible = true;
	}

	private resetGameState(): void {
		this.enemies = [];
		this.playerBullets = [];
		this.enemyBullets = [];
		this.specialBullets = [];
		this.particles = [];
		this.player = new Player();
		this.score = 0;
		this.lastEnemySpawnTime = 0;
		this.lastPlayerBulletTime = 0;
		this.gameStartTime = Date.now();
		this.gameState = GameState.Playing;
		this.isGameOverOverlayVisible = false;
		this.isReady = false;
		this.readyElapsedTime = 0;
		this.specialAttackChargeTime = 0;
		this.specialAttackReady = false;
		this.specialAttackFlashTimer = 0;
	}
}
