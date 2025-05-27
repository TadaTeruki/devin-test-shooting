import { SceneManager } from './SceneManager';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameState } from './interfaces';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class Game {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    sceneManager: SceneManager;
    gameState: GameState;
    lastFrameTime: number;
    animationFrameId: number | null;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;
        
        const context = this.canvas.getContext('2d');
        if (!context) {
            throw new Error('Failed to get 2D context');
        }
        this.ctx = context;
        
        this.sceneManager = new SceneManager();
        this.gameState = GameState.Playing;
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        
        this.init();
    }

    init(): void {
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        this.resetGame();
    }

    startGame(): void {
        if (this.animationFrameId === null) {
            this.gameLoop(0);
        }
    }

    stopGame(): void {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    resetGame(): void {
        this.gameState = GameState.Playing;
        
        const gameScene = new GameScene(() => {
            this.gameState = GameState.GameOver;
            this.sceneManager.changeScene(new GameOverScene(this.resetGame.bind(this)));
        });
        
        this.sceneManager.changeScene(gameScene);
        this.startGame();
    }

    gameLoop(currentTime: number): void {
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        this.sceneManager.update(deltaTime);
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.sceneManager.draw(this.ctx);
        
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    private handleMouseMove(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        this.sceneManager.handleMouseMove(x, y);
    }

    private handleKeyDown(event: KeyboardEvent): void {
        this.sceneManager.handleKeyDown(event.key);
    }

    private handleClick(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        console.log('Game handleClick', x, y, this.gameState);
        this.sceneManager.handleClick(x, y);
    }
}
