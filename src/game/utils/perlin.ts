export class PerlinNoise {
	private permutation: number[] = [];

	constructor(_seed = Math.random() * 10000) {
		const p: number[] = [];
		for (let i = 0; i < 256; i++) {
			p[i] = Math.floor(Math.random() * 256);
		}

		this.permutation = p.concat(p);
	}

	private fade(t: number): number {
		return t * t * t * (t * (t * 6 - 15) + 10);
	}

	private lerp(t: number, a: number, b: number): number {
		return a + t * (b - a);
	}

	private grad(hash: number, x: number, y: number): number {
		const h = hash & 15;
		const u = h < 8 ? x : y;
		const v = h < 4 ? y : x;
		return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
	}

	noise(x: number, y: number): number {
		const absX = Math.abs(x);
		const absY = Math.abs(y);

		const X = Math.floor(absX) & 255;
		const Y = Math.floor(absY) & 255;

		const fractX = absX - Math.floor(absX);
		const fractY = absY - Math.floor(absY);

		const u = this.fade(fractX);
		const v = this.fade(fractY);

		const A = this.permutation[X] + Y;
		const AA = this.permutation[A];
		const AB = this.permutation[A + 1];
		const B = this.permutation[X + 1] + Y;
		const BA = this.permutation[B];
		const BB = this.permutation[B + 1];

		return (
			this.lerp(
				v,
				this.lerp(
					u,
					this.grad(this.permutation[AA], fractX, fractY),
					this.grad(this.permutation[BA], fractX - 1, fractY),
				),
				this.lerp(
					u,
					this.grad(this.permutation[AB], fractX, fractY - 1),
					this.grad(this.permutation[BB], fractX - 1, fractY - 1),
				),
			) *
				0.5 +
			0.5
		); // Normalize to 0-1
	}
}
