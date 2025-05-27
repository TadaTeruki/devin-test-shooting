import { BaseScene } from './scenes/BaseScene';

export class SceneManager {
    currentScene: BaseScene | null;

    constructor() {
        this.currentScene = null;
    }

    changeScene(newScene: BaseScene): void {
        this.currentScene = newScene;
    }

    update(deltaTime: number): void {
        if (this.currentScene) {
            this.currentScene.update(deltaTime);
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.currentScene) {
            this.currentScene.draw(ctx);
        }
    }

    handleMouseMove(x: number, y: number): void {
        if (this.currentScene) {
            this.currentScene.handleMouseMove(x, y);
        }
    }

    handleKeyDown(key: string): void {
        if (this.currentScene) {
            this.currentScene.handleKeyDown(key);
        }
    }

    handleClick(x: number, y: number): void {
        console.log('SceneManager handleClick', x, y, this.currentScene);
        if (this.currentScene) {
            this.currentScene.handleClick(x, y);
        }
    }
}
