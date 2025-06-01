export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 1200;

export const PLAYER_RADIUS = 15;
export const PLAYER_COLOR = "#FFFFFF"; // 白

export const ENEMY_RADIUS = 20;
export const ENEMY_COLOR = "#808080"; // 灰色
export const ENEMY_SPAWN_INTERVAL = 1000; // 1秒ごとに敵を生成
export const ENEMY_SPEED = 200; // 敵の移動速度

export const PLAYER_BULLET_RADIUS = 4;
export const PLAYER_BULLET_COLOR = "#0088FF"; // 青
export const PLAYER_BULLET_SPEED = 500;

export const ENEMY_BULLET_RADIUS = 5;
export const ENEMY_BULLET_COLOR = "#FF3355"; // 赤
export const ENEMY_BULLET_SPEED = 300;
export const ENEMY_SHOOT_INTERVAL = 1000; // 5秒ごとに弾を発射
export const ENEMY_MAX_SCALE_TIME = 120;

export const BACKGROUND_TREE_COLOR = "#226830"; // 暗い緑
export const BACKGROUND_TREE_SHADOW_COLOR = "#333"; // 暗い緑の影
export const BACKGROUND_TREE_RADIUS_MIN = 0;
export const BACKGROUND_TREE_RADIUS_VISIBLE = 30;
export const BACKGROUND_TREE_RADIUS_MAX = 50;
export const BACKGROUND_TREE_SHADOW_OFFSET_X = 10;
export const BACKGROUND_TREE_SHADOW_OFFSET_Y = 10;
export const BACKGROUND_TREE_NOISE_SCALE = 0.002;
export const BACKGROUND_SCROLL_SPEED = 200;
export const BACKGROUND_GRID_SPACING = 10.0; // BACKGROUND_TREE_RADIUS_MAX / 2

export const BACKGROUND_COLOR_GREEN = "#70B322"; // 黄緑
export const BACKGROUND_COLOR_LIGHT_GREEN = "#80EE70"; // 淡い黄緑

export const BACKGROUND_NOISE_SCALE_X = 0.02;
export const BACKGROUND_NOISE_SCALE_Y = 0.08;

export const SHADOW_OFFSET_X = 30;
export const SHADOW_OFFSET_Y = 30;
export const SHADOW_COLOR = "rgba(0, 0, 0, 0.3)";

export const PLAYER_IMAGE_PATH = "/assets/player.png";
export const ENEMY_IMAGE_PATH = "/assets/enemy.png";
export const BACKGROUND_SEA_COLOR = "#2277CC"; // 青
export const BACKGROUND_SEA_RADIUS_MIN = 0;
export const BACKGROUND_SEA_RADIUS_VISIBLE = 40;
export const BACKGROUND_SEA_RADIUS_MAX = 60;
export const BACKGROUND_SEA_NOISE_SCALE = 0.001;

export const BACKGROUND_BEACH_COLOR = "#FFD7A0"; // 薄橙色
export const BACKGROUND_BEACH_RADIUS_FACTOR = 2.0; // 海の半径に対する倍率

export const BACKGROUND_ROAD_COLOR = "#FFD7A0"; // 薄橙色（砂浜と同じ）
export const BACKGROUND_ROAD_RADIUS = 20;
export const BACKGROUND_ROAD_NOISE_THRESHOLD = 0.02; // ノイズ値の絶対値がこの値以下で道路を描画

export const KEY_SPACE = " ";

export const READY_DISPLAY_DURATION = 3; // seconds

export const SCORE_PER_ENEMY = 100;
export const SCORE_DISPLAY_FONT = "bold 24px Arial";
export const SCORE_DISPLAY_COLOR = "#FFFFFF";
export const SCORE_DISPLAY_X = 700;
export const SCORE_DISPLAY_Y = 40;

export const BULLET_AFTERIMAGE_COUNT = 5;
export const BULLET_AFTERIMAGE_ALPHA_DECAY = 0.15;
export const PLAYER_BULLET_FIRE_INTERVAL = 200; // 200ms
export const TITLE_BACKGROUND_COLOR = "#2E3440";
export const GAMEOVER_BACKGROUND_COLOR = "#3B4252";
export const TITLE_PLAYER_POSITION_RATIO = 0.3;
export const TITLE_UI_Y_RATIO = 0.5;

export const HIGH_SCORE_DISPLAY_FONT = "bold 20px Arial";
export const HIGH_SCORE_DISPLAY_COLOR = "#FFFFFF";
export const HIGH_SCORE_DISPLAY_X = CANVAS_WIDTH / 2;
export const HIGH_SCORE_DISPLAY_Y = CANVAS_HEIGHT * TITLE_UI_Y_RATIO - 10;

export const VIEWPORT_CENTER_Y = 517.5;
export const GAMEOVER_TEXT_Y = VIEWPORT_CENTER_Y - 50;
export const GAMEOVER_BUTTON_Y = VIEWPORT_CENTER_Y + 20;
export const GAMEOVER_HIGH_SCORE_DISPLAY_X = CANVAS_WIDTH / 2;
export const GAMEOVER_HIGH_SCORE_DISPLAY_Y = GAMEOVER_TEXT_Y + 40;
