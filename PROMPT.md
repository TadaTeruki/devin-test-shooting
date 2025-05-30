### 1. プロジェクトの概要

このプロジェクトでは、シンプルなレトロなシューティングゲーム「Pevious」を構築します。プレイヤーはマウスで操作する自機を動かし、敵や敵の弾を避けながら、自機の弾で敵を破壊します。衝突が発生するとゲームオーバーとなり、リプレイボタンでゲームを再開できます。画像や複雑なエフェクトは使用せず、図形のみでゲームのコアメカニクスを実装します。

### 2. 技術スタック

* **フロントエンド:** HTML5 Canvas2D
* **言語:** TypeScript
* **パッケージマネージャー:** pnpm
* **ビルドツール:** Vite (開発サーバーとビルドを簡素化するため)

### 3. ファイル構成

```
pevious/
├── public/
│   └── index.html             // メインHTMLファイル
├── src/
│   ├── main.ts                // エントリーポイント、ゲームの初期化
│   └── game/
│       ├── Game.ts            // ゲームのメインロジック、ゲームループ、シーン管理
│       ├── SceneManager.ts    // シーン遷移を管理するクラス
│       ├── scenes/
│       │   ├── BaseScene.ts   // シーンの基底クラス
│       │   ├── GameScene.ts   // メインゲームプレイシーン
│       │   └── GameOverScene.ts // ゲームオーバーシーン
│       ├── entities/
│       │   ├── GameObject.ts  // 全てのゲームオブジェクトの基底クラス/インターフェース
│       │   ├── Player.ts      // プレイヤーエンティティ
│       │   ├── Enemy.ts       // 敵エンティティ
│       │   ├── Bullet.ts      // 弾エンティティ（プレイヤー弾、敵弾共通）
│       │   └── Background.ts  // 背景エンティティ
│       ├── interfaces.ts      // 型定義、インターフェース
│       ├── constants.ts       // ゲーム定数（サイズ、速度、色など）
│       └── utils.ts           // ユーティリティ関数（衝突判定など）
├── tsconfig.json              // TypeScript設定ファイル
├── vite.config.ts             // Vite設定ファイル
└── package.json               // pnpm設定ファイル
```

### 4. シーン構成

ゲームは以下の2つの主要なシーンで構成されます。`SceneManager`がこれらのシーン間の遷移を管理します。

1.  **`GameScene` (ゲームプレイシーン)**
    * プレイヤー、敵、弾、背景などのゲームオブジェクトを管理します。
    * ゲームループ内で、各オブジェクトの更新と描画を行います。
    * 衝突判定を行い、ゲームオーバー条件を満たした場合、`GameOverScene`へ遷移します。
    * 敵の生成ロジックを含みます。
2.  **`GameOverScene` (ゲームオーバーシーン)**
    * 「GAMEOVER」テキストを表示します。
    * 「REPLAY」ボタンを表示し、クリックイベントを処理します。
    * 「REPLAY」ボタンが押された場合、ゲームの状態をリセットし、`GameScene`へ戻ります。

### 5. 型定義 (`src/game/interfaces.ts`)

```typescript
// 2Dベクトル
export interface Vector2D {
    x: number;
    y: number;
}

// 描画可能なオブジェクトのインターフェース
export interface Drawable {
    draw(ctx: CanvasRenderingContext2D): void;
}

// 更新可能なオブジェクトのインターフェース
export interface Updatable {
    update(deltaTime: number): void;
}

// 衝突判定可能なオブジェクトのインターフェース
export interface Collidable {
    position: Vector2D;
    radius: number; // 円形の衝突判定を想定
    isColliding(other: Collidable): boolean;
}

// 全てのゲームオブジェクトが持つべき基本的なプロパティ
export interface IGameObject extends Drawable, Updatable {
    id: string; // ユニークなID
    isActive: boolean; // アクティブ状態（描画・更新対象か）
}

// ゲームの状態を表す列挙型
export enum GameState {
    Playing,
    GameOver,
}

// 弾のタイプ
export enum BulletType {
    Player,
    Enemy,
}
```

### 6. 要件定義の詳細と実装ステップ

#### 6.1. プロジェクトの初期設定

* **ステップ 1: プロジェクトの初期化**
    * `pnpm create vite pevious --template vanilla-ts` を実行し、TypeScript対応のViteプロジェクトを作成します。
    * `cd pevious`
    * `pnpm install`
    * `pnpm dev` で開発サーバーが起動し、ブラウザでGUIが確認できることを確認します。
* **ステップ 2: `index.html` の設定**
    * `public/index.html` にCanvas要素を追加します。
    ```html
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pevious</title>
        <style>
            body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background-color: #222; /* 全体の背景色 */
                overflow: hidden; /* スクロールバーを非表示 */
            }
            canvas {
                border: 2px solid #555;
                background-color: #6B8E23; /* 黄緑色 */
                display: block;
            }
        </style>
    </head>
    <body>
        <canvas id="gameCanvas"></canvas>
        <script type="module" src="/src/main.ts"></script>
    </body>
    </html>
    ```
* **ステップ 3: `src/main.ts` と `src/game/Game.ts` の初期設定**
    * `src/main.ts` でCanvas要素を取得し、`Game`クラスのインスタンスを作成してゲームを開始します。
    * `src/game/Game.ts` にゲームループの骨格を実装します。

#### 6.2. ゲームのコアロジック

* **ステップ 4: `Game` クラスとメインループの実装 (`src/game/Game.ts`)**
    * `Game`クラスは、`canvas`、`ctx`、`sceneManager`、`gameState`、`lastFrameTime` などのプロパティを持ちます。
    * `init()` メソッドでCanvasの初期化とイベントリスナーの設定を行います。
    * `gameLoop(currentTime: DOMHighResTimeStamp)` メソッドで `requestAnimationFrame` を利用したメインループを実装します。
        * `deltaTime` を計算し、`sceneManager.update(deltaTime)` を呼び出します。
        * `ctx.clearRect()` でCanvasをクリアし、`sceneManager.draw(ctx)` を呼び出します。
        * `requestAnimationFrame(this.gameLoop.bind(this))` で次のフレームを要求します。
    * `startGame()` メソッドでゲームループを開始します。
    * `stopGame()` メソッドでゲームループを停止します。
    * `resetGame()` メソッドでゲームの状態を初期化します。
* **ステップ 5: `SceneManager` と `BaseScene` の実装 (`src/game/SceneManager.ts`, `src/game/scenes/BaseScene.ts`)**
    * `SceneManager` は現在のシーンを保持し、`changeScene(newScene: BaseScene)` メソッドでシーンを切り替えます。
    * `BaseScene` は `update(deltaTime: number)` と `draw(ctx: CanvasRenderingContext2D)` メソッドを持つ抽象クラスまたはインターフェースとして定義します。

#### 6.3. エンティティの実装

* **ステップ 6: `GameObject` 基底クラスと `Player` の実装 (`src/game/entities/GameObject.ts`, `src/game/entities/Player.ts`)**
    * `GameObject` は `position: Vector2D`, `radius: number`, `color: string`, `isActive: boolean` などの共通プロパティと、`update()`, `draw()`, `isColliding()` メソッドを持つ基底クラスとして実装します。
    * `Player` クラスは `GameObject` を継承します。
        * 色は**白**い円で描画します。
        * マウスの `mousemove` イベントリスナーを追加し、プレイヤーの `position` をマウスカーソルの位置に追従させます。
        * Canvasの境界内にプレイヤーが留まるように制限します。
* **ステップ 7: `Background` の実装 (`src/game/entities/Background.ts`)**
    * `Background` クラスは `GameObject` を継承します。
    * 背景の基本色はCanvasのスタイルで設定された**黄緑色**（`#6B8E23` など、シックな色合い）を使用します。
    * 背景で上から下に動くオブジェクトとして、**緑色**（`#36454F` など、シックな暗い緑）の円（木に相当）を生成・管理します。
        * 複数の円を配列で持ち、それぞれが異なる速度で下にスクロールするようにします。
        * 画面下端に到達した円は、画面上端に再配置するか、非アクティブにして新しい円を生成します。
    * `update()` メソッドで円の位置を更新し、`draw()` メソッドで描画します。
* **ステップ 8: `Enemy` の実装 (`src/game/entities/Enemy.ts`)**
    * `Enemy` クラスは `GameObject` を継承します。
        * 色は**灰色**の円で描画します。
        * 約1秒ごとに一体、画面端（上部）で生成されるようにします。
        * 生成された敵は画面内上部を適当に（例えば、左右に揺れながら）動き、画面外（下部）に出たら `isActive = false` にして消えるようにします。
        * 敵は一定間隔で弾を発射するロジック（後述）を持ちます。
* **ステップ 9: `Bullet` の実装 (`src/game/entities/Bullet.ts`)**
    * `Bullet` クラスは `GameObject` を継承します。
        * `type: BulletType` (プレイヤー弾か敵弾か) プロパティを持ちます。
        * `velocity: Vector2D` プロパティを持ち、弾の移動方向と速度を決定します。
        * `update()` メソッドで `velocity` に基づいて位置を更新します。
        * 画面外に出たら `isActive = false` にして消えるようにします。
    * **プレイヤー弾:**
        * 色は**青**い小さな円で描画します。
        * 所定のキー（例: `Space` キー）が押されると、プレイヤーの位置から上向きに直進する弾を生成します。
    * **敵弾:**
        * 色は**赤い**小さな円で描画します。
        * 敵の `update()` メソッド内で、一定間隔で弾を生成します。
        * 発射の角度は、現時点では**下向きに直進**するように設定します。
        * **弾をプレイヤーのいる向きに対して発射するようにする**：これは敵の弾生成時に、プレイヤーの位置に向かうベクトルを計算し、その方向に弾の速度を設定することで実現します。

#### 6.4. ゲームメカニクスとUI

* **ステップ 10: 衝突判定の実装 (`src/game/utils.ts`)**
    * `utils.ts` に `checkCollision(obj1: Collidable, obj2: Collidable): boolean` 関数を実装します。
    * この関数は2つの円形オブジェクトの距離を計算し、半径の合計よりも小さければ衝突していると判定します。
* **ステップ 11: `GameScene` の実装 (`src/game/scenes/GameScene.ts`)**
    * `GameScene` は `BaseScene` を継承します。
    * プレイヤー、敵の配列、プレイヤー弾の配列、敵弾の配列を管理します。
    * `update()` メソッド内で以下の処理を行います。
        * 全てのゲームオブジェクトの `update()` を呼び出します。
        * 敵の生成ロジックを実行します。
        * **衝突判定:**
            * プレイヤーと敵の衝突をチェックします。
            * プレイヤーと敵弾の衝突をチェックします。
            * プレイヤー弾と敵の衝突をチェックし、当たった場合は両方を `isActive = false` にします。
        * いずれかの衝突が発生した場合、`Game` クラスの `stopGame()` を呼び出し、`SceneManager` を介して `GameOverScene` に遷移します。
    * `draw()` メソッド内で全てのゲームオブジェクトの `draw()` を呼び出します。
* **ステップ 12: `GameOverScene` の実装 (`src/game/scenes/GameOverScene.ts`)**
    * `GameOverScene` は `BaseScene` を継承します。
    * `draw()` メソッド内で、Canvasの真ん中に「GAMEOVER」というテキストを大きく表示します。
    * その下に「REPLAY」と書かれたボタン（Canvas上に描画された長方形とテキスト）を描画します。
    * Canvasの `click` イベントリスナーを追加し、「REPLAY」ボタンの領域がクリックされたかどうかを判定します。
    * クリックされた場合、`Game` クラスの `resetGame()` を呼び出し、`SceneManager` を介して `GameScene` に遷移します。
* **ステップ 13: 定数とスタイルの調整 (`src/game/constants.ts`)**
    * Canvasの幅 (`CANVAS_WIDTH: 800`, `CANVAS_HEIGHT: 1200`)
    * プレイヤー、敵、弾の半径と速度
    * 敵の生成間隔
    * 背景のスクロール速度
    * 使用する色（シックな黄緑、暗い緑、白、灰色、赤、青）
    * キーコード（例: `KEY_SPACE = ' '`）
    * これらの定数を定義し、コード全体で利用するようにします。

### 7. 拡張性への考慮事項

* **クラス・インターフェース設計:** `GameObject`、`Drawable`、`Updatable`、`Collidable` などのインターフェースや基底クラスを導入することで、新しい種類の敵や弾、アイテムなどを簡単に追加できます。
* **シーン管理:** `SceneManager` を使用することで、タイトル画面やステージ選択画面など、将来的に新しいシーンを追加する際に、既存のゲームロジックに大きな変更を加えることなく対応できます。
* **コンポーネント指向:** 各エンティティのロジックを独立したコンポーネント（例: `MovementComponent`, `ShootingComponent`, `HealthComponent`）として切り出すことで、より複雑な振る舞いを柔軟に組み合わせられるようになります。今回は最低限の雛形なので、まずはシンプルな継承で実装し、必要に応じてリファクタリングを検討します。
