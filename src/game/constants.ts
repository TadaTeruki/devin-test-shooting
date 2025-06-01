export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 1000;

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
export const BACKGROUND_TREE_RADIUS_VISIBLE = 20;
export const BACKGROUND_TREE_RADIUS_MAX = 30;
export const BACKGROUND_TREE_SHADOW_OFFSET_X = 15;
export const BACKGROUND_TREE_SHADOW_OFFSET_Y = 10;
export const BACKGROUND_TREE_NOISE_SCALE = 0.002;
export const BACKGROUND_SCROLL_SPEED = 200;
export const BACKGROUND_GRID_SPACING = 10.0; // BACKGROUND_TREE_RADIUS_MAX / 2

export const BACKGROUND_COLOR_GREEN = "#70B322"; // 黄緑
export const BACKGROUND_COLOR_LIGHT_GREEN = "#80EE70"; // 淡い黄緑

export const BACKGROUND_LEAF_COLOR_DARK = "#FB6533"; // 暗い茶色
export const BACKGROUND_LEAF_COLOR_LIGHT = "#50723D"; // 明るい茶色
export const BACKGROUND_LEAF_NOISE_SCALE = 0.0005;
export const BACKGROUND_LEAF_NOISE_THRESHOLD = 0.7;
export const BACKGROUND_LEAF_COLOR_NOISE_SCALE_X = 0.02;
export const BACKGROUND_LEAF_COLOR_NOISE_SCALE_Y = 0.08;

export const BACKGROUND_NOISE_SCALE_X = 0.02;
export const BACKGROUND_NOISE_SCALE_Y = 0.08;

export const SHADOW_OFFSET_X = 30;
export const SHADOW_OFFSET_Y = 30;
export const SHADOW_COLOR = "rgba(0, 0, 0, 0.3)";

export const PLAYER_IMAGE_PATH = "/assets/player.png";
export const ENEMY_IMAGE_PATH = "/assets/enemy.png";

export const ENEMY_NORMAL_COLOR = "#00FF00";
export const ENEMY_FAST_COLOR = "#8A2BE2";
export const ENEMY_HEAVY_COLOR = "#808080";

export const ENEMY_NORMAL_SPEED = ENEMY_SPEED;
export const ENEMY_FAST_SPEED = ENEMY_SPEED * 2;
export const ENEMY_HEAVY_SPEED = ENEMY_SPEED;

export const ENEMY_NORMAL_SHOOT_INTERVAL = ENEMY_SHOOT_INTERVAL;
export const ENEMY_FAST_SHOOT_INTERVAL = ENEMY_SHOOT_INTERVAL * 2;
export const ENEMY_HEAVY_SHOOT_INTERVAL = ENEMY_SHOOT_INTERVAL * 0.5;

export const ENEMY_NORMAL_RADIUS = ENEMY_RADIUS;
export const ENEMY_FAST_RADIUS = ENEMY_RADIUS;
export const ENEMY_HEAVY_RADIUS = ENEMY_RADIUS * 1.5;

export const ENEMY_NORMAL_HEALTH = 1;
export const ENEMY_FAST_HEALTH = 1;
export const ENEMY_HEAVY_HEALTH = 5;

export const ENEMY_FAST_IMAGE_PATH = "/assets/enemy-purple.png";
export const ENEMY_HEAVY_IMAGE_PATH = "/assets/enemy-gray.png";

export const PLAYER_SHOOT_SOUND_PATH = "/sounds/8bit_shoot1.mp3";
export const ENEMY_SHOOT_SOUND_PATH = "/sounds/8bit_laser1.mp3";
export const EXPLOSION_SOUND_PATH = "/sounds/game_explosion6.mp3";
export const PLAYER_DAMAGE_SOUND_PATH = "/sounds/game_explosion6.mp3";
export const ENEMY_SPAWN_SOUND_PATH = "/sounds/8bit_laser2.mp3";
export const BUTTON_CLICK_SOUND_PATH = "/sounds/button01a.mp3";
export const BUTTON_SELECT_SOUND_PATH = "/sounds/select01.mp3";
export const SPECIAL_ATTACK_SOUND_PATH = "/sounds/special_attack.mp3";
export const BGM_PATH = "/sounds/bgm.mp3";

export const ENEMY_HEAVY_BULLET_COLOR = "#8A2BE2";
export const ENEMY_DAMAGE_FLASH_DURATION = 150;
export const ENEMY_DAMAGE_FLASH_COLOR = "#FFFFFF";

export const PARTICLE_LIFETIME = 1000;
export const PARTICLE_COUNT_MIN = 5;
export const PARTICLE_COUNT_MAX = 8;
export const PARTICLE_SPEED_MIN = 50;
export const PARTICLE_SPEED_MAX = 150;
export const PARTICLE_RADIUS_MIN = 3;
export const PARTICLE_RADIUS_MAX = 8;
export const PARTICLE_COLORS = ["#FFFFFF", "#FFFF00", "#FF0000", "#FFA500"];
export const BACKGROUND_SEA_COLOR = "#2277CC"; // 青
export const BACKGROUND_SEA_RADIUS_MIN = 0;
export const BACKGROUND_SEA_RADIUS_VISIBLE = 40;
export const BACKGROUND_SEA_RADIUS_MAX = 60;
export const BACKGROUND_SEA_NOISE_SCALE = 0.001;

export const BACKGROUND_BEACH_COLOR = "#FFD7A0"; // 薄橙色
export const BACKGROUND_BEACH_RADIUS_FACTOR = 2.0; // 海の半径に対する倍率

export const BACKGROUND_ROAD_COLOR = "#D0B070"; // 灰色
export const BACKGROUND_ROAD_RADIUS = 20;
export const BACKGROUND_ROAD_NOISE_THRESHOLD = 0.02; // ノイズ値の絶対値がこの値以下で道路を描画

export const KEY_SPACE = " ";

export const READY_DISPLAY_DURATION = 3; // seconds

export const SCORE_PER_ENEMY = 100;
export const SCORE_PER_HEAVY_ENEMY = 300;
export const SCORE_DISPLAY_FONT = "bold 24px Arial";
export const SCORE_DISPLAY_COLOR = "#FFFFFF";
export const SCORE_DISPLAY_X = CANVAS_WIDTH - 30;
export const SCORE_DISPLAY_Y = 30;

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

export const TITLE_FONT = "italic 48px 'Playfair Display', serif";
export const TITLE_START_BUTTON_FONT = "bold 24px 'Playfair Display', serif";
export const TITLE_CONTROLS_FONT = "20px 'Playfair Display', serif";

export const TITLE_OVERLAY_COLOR = "rgba(59, 66, 82, 0.7)";

export const CONTROL_INSTRUCTIONS = [
	"マウス: 移動",
	"スペースキー: 弾発射",
	"Pキー: 必殺技"
];
export const CONTROLS_START_Y = CANVAS_HEIGHT * 0.65;
export const CONTROLS_LINE_HEIGHT = 30;

export const VIEWPORT_CENTER_Y = 517.5;
export const GAMEOVER_TEXT_Y = VIEWPORT_CENTER_Y - 50;
export const GAMEOVER_BUTTON_Y = VIEWPORT_CENTER_Y + 20;
export const GAMEOVER_HIGH_SCORE_DISPLAY_X = CANVAS_WIDTH / 2;
export const GAMEOVER_HIGH_SCORE_DISPLAY_Y = GAMEOVER_TEXT_Y + 40;

export const INITIAL_LIVES = 3;
export const PLAYER_RESPAWN_TIME = 1000;
export const PLAYER_INVINCIBILITY_TIME = 2000;
export const PLAYER_BLINK_INTERVAL = 10;
export const LIVES_DISPLAY_X = 40;
export const LIVES_DISPLAY_Y = 40;
export const LIVES_DISPLAY_SPACING = 40;

export const SPECIAL_ATTACK_CHARGE_TIME = 3000;
export const SPECIAL_ATTACK_KEY = "p";
export const SPECIAL_BULLET_COLOR = "#F0C700";
export const SPECIAL_BULLET_SPEED = 800;
export const SPECIAL_BULLET_HOMING_RATIO_INITIAL = 0.1;
export const SPECIAL_BULLET_HOMING_RATIO_FINAL = 1.0;
export const SPECIAL_BULLET_HOMING_DURATION = 6000;
export const SPECIAL_GAUGE_WIDTH = 200;
export const SPECIAL_GAUGE_HEIGHT = 20;
export const SPECIAL_GAUGE_X = (CANVAS_WIDTH - SPECIAL_GAUGE_WIDTH) / 2;
export const SPECIAL_GAUGE_Y = CANVAS_HEIGHT * 0.9;
export const SPECIAL_GAUGE_BG_COLOR = "#808080";
export const SPECIAL_GAUGE_FILL_COLOR = "#FFD500";
export const SPECIAL_GAUGE_FLASH_COLOR = "#FFFFFF";
export const CLOUD_SCROLL_SPEED = 350;
export const CLOUD_COLOR_LIGHT = "#FFFFFF";
export const CLOUD_COLOR_DARK = "#E8E8E8";
export const CLOUD_OPACITY = 0.7;
export const CLOUD_NOISE_SCALE = 0.003;
export const CLOUD_NOISE_THRESHOLD = 0.7;
export const CLOUD_RADIUS_MIN = 0;
export const CLOUD_RADIUS_MAX = 20;
export const CLOUD_RADIUS_VISIBLE = 20;
export const CLOUD_GRID_SPACING = 15.0;

export const SPECIAL_BULLET_AFTERIMAGE_COUNT = 20;
export const SPECIAL_BULLET_AFTERIMAGE_ALPHA_DECAY = 0.15;
export const SPECIAL_BULLET_RING_BLINK_INTERVAL = 15;
export const SPECIAL_BULLET_RING_COLOR = "#FFEE88";
export const SPECIAL_BULLET_DAMAGE = 10;
