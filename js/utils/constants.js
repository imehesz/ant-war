// js/utils/constants.js

const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;

const MOUND_START_HEALTH = 100;
const MOUND_START_RESOURCES = 0;
const FIGHTER_SPAWN_INTERVAL = 10000; // 10 seconds in ms
const FOOD_SPAWN_INTERVAL = 5000;    // 5 seconds in ms
const MAX_FOOD_SOURCES = 15;

const ANT_SPEED = 50;
const GATHERER_SPEED = 40;
const MEGA_FIGHTER_SPEED = 35;

const FIGHTER_DAMAGE = 10;
const MEGA_FIGHTER_DAMAGE = 30;
const SAND_BOMB_DAMAGE = 50;
const SAND_TORNADO_SPEED = 150;

const FOOD_RESOURCE_VALUE = 5;

const POWERUP_COSTS = {
    GATHERER: 15,
    FIGHTER: 30,
    MEGA_FIGHTER: 50,
    SAND_BOMB: 100,
};

const MAX_ANTS = {
    GATHERER: 10, // Max purchasable (total can be higher with initial)
    FIGHTER: 10,  // Max purchasable (total can be higher with initial/auto-spawn)
};

// --- Asset Keys (replace with your actual filenames if you add real assets) ---
const ASSETS = {
    MOUND: 'mound',
    FOOD: 'food',
    FIGHTER_ANT: 'fighter_ant',
    GATHERER_ANT: 'gatherer_ant',
    GATHERER_ANT_CARRYING: 'gatherer_ant_carrying',
    MEGA_FIGHTER_ANT: 'mega_fighter_ant',
    POWERUP_BG: 'powerup_bg',
    BACKGROUND_TILE: 'background_tile',
    SAND_TORNADO: 'sand_tornado',
    // Add sound keys later if needed
};