export class HighScoreManager {
	private static readonly HIGH_SCORE_KEY = "pevious_high_score";

	static getHighScore(): number {
		const stored = localStorage.getItem(this.HIGH_SCORE_KEY);
		return stored ? parseInt(stored, 10) : 0;
	}

	static setHighScore(score: number): void {
		const currentHighScore = this.getHighScore();
		if (score > currentHighScore) {
			localStorage.setItem(this.HIGH_SCORE_KEY, score.toString());
		}
	}

	static isNewHighScore(score: number): boolean {
		return score > this.getHighScore();
	}
}
