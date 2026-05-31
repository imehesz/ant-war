// js/scenes/LevelCompleteScene.js
class LevelCompleteScene extends Phaser.Scene {
    constructor() {
        super('LevelCompleteScene');
    }

    create() {
        console.log("LevelCompleteScene create");

        const completedLevel = this.registry.get('completedLevel');
        const nextLevel = this.registry.get('nextLevel');

        this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSETS.HOME_SCREEN_BG)
            .setOrigin(0, 0).setDepth(-10).setTint(0x555555).setTileScale(0.6);

        const centerX = GAME_WIDTH / 2;

        // Victory banner
        this.add.text(centerX, 160, '🏆 VICTORY! 🏆', {
            fontSize: '36px',
            fill: '#ffcc00',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);

        // Level complete text
        if (completedLevel) {
            this.add.text(centerX, 220, `Level ${completedLevel.id} Cleared:`, {
                fontSize: '18px',
                fill: '#aaa'
            }).setOrigin(0.5).setDepth(10);

            this.add.text(centerX, 245, completedLevel.name, {
                fontSize: '22px',
                fill: '#fff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(10);
        }

        // Stats
        const playerHP = this.registry.get('playerHPAtEnd') || 0;
        const aiHP = this.registry.get('aiHPAtEnd') || 0;

        this.add.text(centerX, 300, 'Mission Report', {
            fontSize: '20px',
            fill: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(10);

        this.add.text(centerX, 330, `Your Mound: ${playerHP} HP remaining`, {
            fontSize: '16px',
            fill: '#44ff44'
        }).setOrigin(0.5).setDepth(10);

        // Buttons
        const btnY = 410;

        if (nextLevel) {
            const nextBtn = this.add.text(centerX, btnY, 'Next Mission ▶', {
                fontSize: '26px',
                fill: '#0f0',
                backgroundColor: '#2a5a2a',
                padding: { left: 20, right: 20, top: 12, bottom: 12 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

            nextBtn.on('pointerdown', () => {
                this.registry.set('currentLevel', nextLevel);
                this.scene.start('GameScene');
            });
            this.addHoverEffect(nextBtn);
        }

        // Replay button
        const replayBtn = this.add.text(centerX, btnY + 70, 'Replay Mission', {
            fontSize: '22px',
            fill: '#ffcc00',
            backgroundColor: '#5a5a2a',
            padding: { left: 15, right: 15, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

        replayBtn.on('pointerdown', () => {
            this.registry.set('currentLevel', completedLevel);
            this.scene.start('GameScene');
        });
        this.addHoverEffect(replayBtn);

        // Level select button
        const selectBtn = this.add.text(centerX, btnY + 130, 'Level Select', {
            fontSize: '22px',
            fill: '#aaf',
            backgroundColor: '#3a3a5a',
            padding: { left: 15, right: 15, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

        selectBtn.on('pointerdown', () => this.scene.start('LevelSelectScene'));
        this.addHoverEffect(selectBtn);

        // Main menu
        const menuBtn = this.add.text(centerX, btnY + 190, 'Main Menu', {
            fontSize: '22px',
            fill: '#fff',
            backgroundColor: '#555',
            padding: { left: 15, right: 15, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

        menuBtn.on('pointerdown', () => this.scene.start('HomeScene'));
        this.addHoverEffect(menuBtn);

        // Unlock message
        if (nextLevel) {
            this.time.delayedCall(800, () => {
                this.add.text(centerX, 590, `🔓 New Mission Unlocked: ${nextLevel.name}`, {
                    fontSize: '15px',
                    fill: '#66ddff',
                    fontStyle: 'italic'
                }).setOrigin(0.5).setDepth(10);
            });
        }
    }

    addHoverEffect(button, hoverTint = 0xcccccc) {
        button.on('pointerover', () => button.setTint(hoverTint));
        button.on('pointerout', () => button.clearTint());
        button.on('pointerdown', () => button.setTint(0xaaaaaa));
        button.on('pointerup', () => button.clearTint());
    }
}
