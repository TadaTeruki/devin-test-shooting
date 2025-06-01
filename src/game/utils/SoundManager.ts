export class SoundManager {
	private static instance: SoundManager;
	private audioContext: AudioContext | null;
	private soundCache: Map<string, AudioBuffer>;
	private loadingPromises: Map<string, Promise<AudioBuffer>>;
	private bgmSource: AudioBufferSourceNode | null = null;
	private bgmBuffer: AudioBuffer | null = null;
	private bgmGainNode: GainNode | null = null;

	private constructor() {
		this.audioContext = null;
		this.soundCache = new Map();
		this.loadingPromises = new Map();
	}

	public static getInstance(): SoundManager {
		if (!SoundManager.instance) {
			SoundManager.instance = new SoundManager();
		}
		return SoundManager.instance;
	}

	private initAudioContext(): void {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		}
	}

	public loadSound(key: string, src: string): Promise<AudioBuffer> {
		if (this.soundCache.has(key)) {
			return Promise.resolve(this.soundCache.get(key)!);
		}

		if (this.loadingPromises.has(key)) {
			return this.loadingPromises.get(key)!;
		}

		const loadPromise = new Promise<AudioBuffer>((resolve, reject) => {
			fetch(src)
				.then(response => response.arrayBuffer())
				.then(arrayBuffer => {
					this.initAudioContext();
					if (!this.audioContext) {
						throw new Error("Failed to initialize audio context");
					}
					return this.audioContext.decodeAudioData(arrayBuffer);
				})
				.then(audioBuffer => {
					this.soundCache.set(key, audioBuffer);
					this.loadingPromises.delete(key);
					resolve(audioBuffer);
				})
				.catch(error => {
					this.loadingPromises.delete(key);
					reject(new Error(`Failed to load sound: ${src} - ${error.message}`));
				});
		});

		this.loadingPromises.set(key, loadPromise);
		return loadPromise;
	}

	public getSound(key: string): AudioBuffer | null {
		return this.soundCache.get(key) || null;
	}

	public preloadSounds(sounds: { key: string; src: string }[]): Promise<void> {
		const promises = sounds.map(({ key, src }) => this.loadSound(key, src));
		return Promise.all(promises).then(() => {});
	}

	public playSound(key: string, volume: number = 0.5): void {
		try {
			this.initAudioContext();
			
			if (!this.audioContext) {
				console.warn("Audio context not available");
				return;
			}

			if (this.audioContext.state === 'suspended') {
				this.audioContext.resume();
			}

			const audioBuffer = this.getSound(key);
			if (!audioBuffer) {
				console.warn(`Sound not found: ${key}`);
				return;
			}

			const source = this.audioContext.createBufferSource();
			const gainNode = this.audioContext.createGain();
			
			source.buffer = audioBuffer;
			gainNode.gain.value = Math.max(0, Math.min(1, volume));
			
			source.connect(gainNode);
			gainNode.connect(this.audioContext.destination);
			
			source.start();
		} catch (error) {
			console.warn(`Failed to play sound ${key}:`, error);
		}
	}

	public async playBGM(bgmName: string, volume: number = 0.3): Promise<void> {
		try {
			this.stopBGM();
			
			const buffer = await this.loadSound(bgmName, `/sounds/${bgmName}.mp3`);
			if (!buffer) return;

			this.initAudioContext();
			if (!this.audioContext) {
				console.warn("Audio context not available for BGM");
				return;
			}

			if (this.audioContext.state === 'suspended') {
				await this.audioContext.resume();
			}

			this.bgmBuffer = buffer;
			this.bgmGainNode = this.audioContext.createGain();
			this.bgmGainNode.gain.value = volume;
			this.bgmGainNode.connect(this.audioContext.destination);

			this.startBGMLoop();
		} catch (error) {
			console.error(`Error playing BGM ${bgmName}:`, error);
		}
	}

	private startBGMLoop(): void {
		if (!this.bgmBuffer || !this.bgmGainNode || !this.audioContext) return;

		this.bgmSource = this.audioContext.createBufferSource();
		this.bgmSource.buffer = this.bgmBuffer;
		this.bgmSource.loop = true;
		this.bgmSource.connect(this.bgmGainNode);
		this.bgmSource.start();
	}

	public stopBGM(): void {
		if (this.bgmSource) {
			this.bgmSource.stop();
			this.bgmSource.disconnect();
			this.bgmSource = null;
		}
		if (this.bgmGainNode) {
			this.bgmGainNode.disconnect();
			this.bgmGainNode = null;
		}
	}

	public setBGMVolume(volume: number): void {
		if (this.bgmGainNode) {
			this.bgmGainNode.gain.value = volume;
		}
	}
}
