// js/main.js

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: [PreloadScene, HomeScene, LevelSelectScene, GameScene, LevelCompleteScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    pixelArt: true,
    audio: {
        disableWebAudio: false
    }
};

// Create the game instance
const game = new Phaser.Game(config);

// Initialize registry defaults
game.registry.set('musicVolume', 0);
game.registry.set('sfxVolume', 50);

// Load level progress from localStorage
const savedLevel = GameSave.get('maxUnlockedLevel', 1);
game.registry.set('maxUnlockedLevel', savedLevel);
