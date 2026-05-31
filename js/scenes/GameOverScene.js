// js/scenes/GameOverScene.js
class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create() {
        console.log("GameOverScene create");

        const failedLevel = this.registry.get('currentLevel');

        this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSETS.HOME_SCREEN_BG)
            .setOrigin(0, 0).setDepth(-10).setTint(0x441111).setTileScale(0.6);

        const centerX = GAME_WIDTH / 2;

        this.add.text(centerX, 120, '💀 DEFEAT 💀', {
            fontSize: '36px',
            fill: '#ff4444',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10);

        if (failedLevel) {
            this.add.text(centerX, 175, `Level ${failedLevel.id}: ${failedLevel.name}`, {
                fontSize: '18px',
                fill: '#ccc'
            }).setOrigin(0.5).setDepth(10);
        }

        this.add.text(centerX, 220, 'Your mound has fallen...', {
            fontSize: '16px',
            fill: '#ff8888'
        }).setOrigin(0.5).setDepth(10);

        const btnY = 310;

        // Retry
        const retryBtn = this.add.text(centerX, btnY, 'Try Again', {
            fontSize: '28px',
            fill: '#ff6600',
            backgroundColor: '#5a3a2a',
            padding: { left: 20, right: 20, top: 12, bottom: 12 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

        retryBtn.on('pointerdown', () => {
            this.registry.set('currentLevel', failedLevel);
            this.scene.start('GameScene');
        });
        this.addHoverEffect(retryBtn);

        // Level select
        const selectBtn = this.add.text(centerX, btnY + 70, 'Level Select', {
            fontSize: '22px',
            fill: '#aaf',
            backgroundColor: '#3a3a5a',
            padding: { left: 15, right: 15, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

        selectBtn.on('pointerdown', () => this.scene.start('LevelSelectScene'));
        this.addHoverEffect(selectBtn);

        // Main menu
        const menuBtn = this.add.text(centerX, btnY + 130, 'Main Menu', {
            fontSize: '22px',
            fill: '#fff',
            backgroundColor: '#555',
            padding: { left: 15, right: 15, top: 8, bottom: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);

        menuBtn.on('pointerdown', () => this.scene.start('HomeScene'));
        this.addHoverEffect(menuBtn);

        // Tip
        const tips = [
            "Tip: Buy Mega Fighters to counter enemy Megas.",
            "Tip: More Gatherers = more resources = bigger army.",
            "Tip: Sand Bombs are costly but can turn the tide.",
            "Tip: Balance your army — don't neglect defenses.",
            "Tip: Higher levels require careful resource management."
        ];
        const tip = tips[Math.floor(Math.random() * tips.length)];

        this.add.text(centerX, 540, tip, {
            fontSize: '13px',
            fill: '#aaa',
            fontStyle: 'italic',
            wordWrap: { width: GAME_WIDTH - 60 },
            align: 'center'
        }).setOrigin(0.5).setDepth(10);
    }

    addHoverEffect(button, hoverTint = 0xcccccc) {
        button.on('pointerover', () => button.setTint(hoverTint));
        button.on('pointerout', () => button.clearTint());
        button.on('pointerdown', () => button.setTint(0xaaaaaa));
        button.on('pointerup', () => button.clearTint());
    }
}
