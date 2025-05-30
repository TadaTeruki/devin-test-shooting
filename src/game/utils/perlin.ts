export class PerlinNoise {
    private permutation: number[] = [];
    
    constructor(seed = Math.random() * 10000) {
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
        x = Math.abs(x);
        y = Math.abs(y);
        
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        
        const u = this.fade(x);
        const v = this.fade(y);
        
        const A = this.permutation[X] + Y;
        const AA = this.permutation[A];
        const AB = this.permutation[A + 1];
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B];
        const BB = this.permutation[B + 1];
        
        return this.lerp(v, 
            this.lerp(u, this.grad(this.permutation[AA], x, y), 
                this.grad(this.permutation[BA], x - 1, y)),
            this.lerp(u, this.grad(this.permutation[AB], x, y - 1), 
                this.grad(this.permutation[BB], x - 1, y - 1))
        ) * 0.5 + 0.5; // Normalize to 0-1
    }
}
