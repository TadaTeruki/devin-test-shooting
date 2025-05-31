/**
 * 画像の読み込みと管理を行うクラス
 */
export class ImageManager {
	private static instance: ImageManager;
	private imageCache: Map<string, HTMLImageElement>;
	private loadingPromises: Map<string, Promise<HTMLImageElement>>;

	private constructor() {
		this.imageCache = new Map();
		this.loadingPromises = new Map();
	}

	/**
	 * シングルトンインスタンスを取得
	 */
	public static getInstance(): ImageManager {
		if (!ImageManager.instance) {
			ImageManager.instance = new ImageManager();
		}
		return ImageManager.instance;
	}

	/**
	 * 画像を読み込む
	 * @param key 画像を識別するためのキー
	 * @param src 画像のパス
	 * @returns 読み込まれた画像のPromise
	 */
	public loadImage(key: string, src: string): Promise<HTMLImageElement> {
		if (this.imageCache.has(key)) {
			return Promise.resolve(this.imageCache.get(key)!);
		}

		if (this.loadingPromises.has(key)) {
			return this.loadingPromises.get(key)!;
		}

		const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				this.imageCache.set(key, img);
				this.loadingPromises.delete(key);
				resolve(img);
			};
			img.onerror = () => {
				this.loadingPromises.delete(key);
				reject(new Error(`Failed to load image: ${src}`));
			};
			img.src = src;
		});

		this.loadingPromises.set(key, loadPromise);
		return loadPromise;
	}

	/**
	 * 画像を取得
	 * @param key 画像を識別するためのキー
	 * @returns キャッシュされた画像、なければnull
	 */
	public getImage(key: string): HTMLImageElement | null {
		return this.imageCache.get(key) || null;
	}

	/**
	 * 複数の画像を一括で読み込む
	 * @param images キーとパスのペアの配列
	 * @returns すべての画像が読み込まれたときに解決するPromise
	 */
	public preloadImages(images: { key: string; src: string }[]): Promise<void> {
		const promises = images.map(({ key, src }) => this.loadImage(key, src));
		return Promise.all(promises).then(() => {});
	}
}
