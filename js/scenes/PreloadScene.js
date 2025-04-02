// js/scenes/PreloadScene.js
class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        console.log("Preloading assets...");
        this.load.path = 'assets/'; // Set base path for assets

        // Create placeholder graphics if actual assets don't exist
        /*
        this.createPlaceholder(ASSETS.MOUND, 50, 50, '8B4513'); // Brown
        this.createPlaceholder(ASSETS.FOOD, 10, 10, '00FF00'); // Green
        this.createPlaceholder(ASSETS.FIGHTER_ANT, 15, 15, 'FF0000'); // Red
        this.createPlaceholder(ASSETS.GATHERER_ANT, 15, 15, '0000FF'); // Blue
        this.createPlaceholder(ASSETS.GATHERER_ANT_CARRYING, 15, 15, '0000FF'); // Blue
        this.createPlaceholder(ASSETS.MEGA_FIGHTER_ANT, 25, 25, '8B0000'); // Dark Red
        this.createPlaceholder(ASSETS.POWERUP_BG, 60, 40, '808080'); // Gray
        */

        // Example of loading actual images (if you have them)
        this.load.image(ASSETS.MOUND, 'mound.png');
        this.load.image(ASSETS.FOOD, 'food.png');
        this.load.image(ASSETS.FIGHTER_ANT, 'fighter_ant.png');
        this.load.image(ASSETS.GATHERER_ANT, 'gatherer_ant.png');
        this.load.image(ASSETS.GATHERER_ANT_CARRYING, 'gatherer_ant_carrying.png');
        this.load.image(ASSETS.MEGA_FIGHTER_ANT, 'mega_fighter_ant.png');
        this.load.image(ASSETS.POWERUP_BG, 'powerup_bg.png');
        this.load.image(ASSETS.BACKGROUND_TILE, 'bg-tile.png');
        this.load.image(ASSETS.SAND_TORNADO, 'sand_tornado.png');


        // Add loading progress bar (optional but good practice)
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(GAME_WIDTH / 2 - 160, GAME_HEIGHT / 2 - 25, 320, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            console.log("Asset loading complete.");
            progressBar.destroy();
            progressBox.destroy();
            this.scene.start('GameScene');
        });
    }

    createPlaceholder(key, width, height, color) {
        // Only create if an image with the same key wasn't loaded
        if (!this.textures.exists(key)) {
            let graphics = this.make.graphics({ width: width, height: height });
            graphics.fillStyle(parseInt(color, 16), 1);
            graphics.fillRect(0, 0, width, height);
            graphics.generateTexture(key, width, height);
            graphics.destroy();
            console.log(`Created placeholder texture: ${key}`);
        } else {
             console.log(`Texture already exists: ${key}`);
        }
    }

    create() {
        // Scene transition happens in 'complete' event handler
    }
}