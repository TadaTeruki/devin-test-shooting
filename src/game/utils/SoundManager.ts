export class SoundManager {
	private static instance: SoundManager;
	private audioContext: AudioContext | null = null;
	private audioBuffers: Map<string, AudioBuffer> = new Map();
	private soundPaths: Map<string, string> = new Map();

	private constructor() {
		this.initializeSoundPaths();
	}

	public static getInstance(): SoundManager {
		if (!SoundManager.instance) {
			SoundManager.instance = new SoundManager();
		}
		return SoundManager.instance;
	}

	private initializeSoundPaths(): void {
		this.soundPaths.set("player-shoot", "/sounds/8bit_shoot1.mp3");
		this.soundPaths.set("enemy-shoot", "/sounds/8bit_laser1.mp3");
		this.soundPaths.set("enemy-spawn", "/sounds/8bit_laser2.mp3");
		this.soundPaths.set("explosion", "/sounds/game_explosion1.mp3");
		this.soundPaths.set("player-damage", "/sounds/game_explosion2.mp3");
		this.soundPaths.set("button-click", "/sounds/button01a.mp3");
	}

	private initAudioContext(): void {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
	}

	public async loadSounds(): Promise<void> {
		this.initAudioContext();
		if (!this.audioContext) return;

		const promises: Promise<void>[] = [];
		
		for (const [key, path] of this.soundPaths) {
			promises.push(this.loadSound(key, path));
		}

		return Promise.all(promises).then(() => {});
	}

	private async loadSound(key: string, path: string): Promise<void> {
		try {
			const response = await fetch(path);
			const arrayBuffer = await response.arrayBuffer();
			
			if (this.audioContext) {
				const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
				this.audioBuffers.set(key, audioBuffer);
			}
		} catch (error) {
			console.error(`Failed to load sound ${key}:`, error);
		}
	}

	public playSound(key: string, volume: number = 0.1): void {
		try {
			this.initAudioContext();
			
			if (!this.audioContext || !this.audioBuffers.has(key)) {
				return;
			}

			const audioBuffer = this.audioBuffers.get(key);
			if (!audioBuffer) return;

			const source = this.audioContext.createBufferSource();
			const gainNode = this.audioContext.createGain();
			
			source.buffer = audioBuffer;
			gainNode.gain.value = Math.max(0, Math.min(1, volume));
			
			source.connect(gainNode);
			gainNode.connect(this.audioContext.destination);
			
			source.start();
		} catch (error) {
			console.error(`Failed to play sound ${key}:`, error);
		}
	}
}
