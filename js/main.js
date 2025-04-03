// js/main.js

const config = {
    type: Phaser.AUTO, // Use WebGL if available, otherwise Canvas
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container', // ID of the div in index.html
    physics: {
        default: 'arcade',
        arcade: {
            debug: false, // Set to true for collision boxes
            gravity: { y: 0 } // Top-down game, no gravity needed
        }
    },
    scene: [PreloadScene, GameScene, HomeScene], // Scenes array
    scale: {
        mode: Phaser.Scale.FIT, // Fit the game within the container
        autoCenter: Phaser.Scale.CENTER_BOTH // Center horizontally and vertically
    },
    pixelArt: true, // Ensures pixel art isn't blurred by anti-aliasing
    audio: {
        disableWebAudio: false // Disable web audio for better compatibility
    }
};

// Create the game instance
const game = new Phaser.Game(config);