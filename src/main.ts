import { Game } from "./game/Game";

document.addEventListener("DOMContentLoaded", () => {
	try {
		const game = new Game("gameCanvas");
		game.startGame();


	} catch (error) {
		console.error("Failed to initialize game:", error);
	}
});
