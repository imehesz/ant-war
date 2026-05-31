// js/scenes/LevelSelectScene.js
class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super('LevelSelectScene');
    }

    create() {
        console.log("LevelSelectScene create");

        // Background
        this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSETS.HOME_SCREEN_BG)
            .setOrigin(0, 0).setDepth(-10).setTint(0x777777).setTileScale(0.6);

        const centerX = GAME_WIDTH / 2;

        // Title
        this.add.text(centerX, 35, 'Select Mission', {
            fontSize: '26px', fill: '#ffcc00', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setDepth(10);

        // Back button
        const backBtn = this.add.text(10, 10, '< Back', {
            fontSize: '16px', fill: '#fff', backgroundColor: '#555',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0, 0).setInteractive({ useHandCursor: true }).setDepth(10);
        backBtn.on('pointerdown', () => this.scene.start('HomeScene'));
        backBtn.on('pointerover', () => backBtn.setTint(0xcccccc));
        backBtn.on('pointerout', () => backBtn.clearTint());

        // Get progression state
        const maxUnlocked = this.registry.get('maxUnlockedLevel') || 1;

        // Grid layout: 2 columns, 4 rows — fits in 480x800
        const cols = 2;
        const rows = 4;
        const cardWidth = 210;
        const cardHeight = 88;
        const gapX = 12;
        const gapY = 10;
        const gridStartY = 250;

        // Center the grid horizontally
        const gridWidth = cols * cardWidth + (cols - 1) * gapX;
        const gridStartX = (GAME_WIDTH - gridWidth) / 2;

        LEVELS.forEach((level, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const cardX = gridStartX + col * (cardWidth + gapX);
            const cardY = gridStartY + row * (cardHeight + gapY);
            const isUnlocked = level.id <= maxUnlocked;
            const isCompleted = level.id < maxUnlocked;

            this.createLevelCard(cardX, cardY, cardWidth, cardHeight, level, isUnlocked, isCompleted);
        });
    }

    createLevelCard(x, y, w, h, level, isUnlocked, isCompleted) {
        // Card background via a single container approach
        const card = this.add.container(0, 0).setDepth(1);

        // Background rectangle
        const bg = this.add.graphics();
        const bgColor = !isUnlocked ? 0x333333 : (isCompleted ? 0x1a4a1a : 0x1a2a4a);
        const borderColor = !isUnlocked ? 0x555555 : (isCompleted ? 0x44cc44 : 0x4488ff);
        bg.fillStyle(bgColor, isUnlocked ? 0.88 : 0.55);
        bg.lineStyle(2, borderColor);
        bg.fillRoundedRect(x, y, w, h, 6);
        bg.strokeRoundedRect(x, y, w, h, 6);
        card.add(bg);

        // Level number circle
        const numX = x + 22;
        const numY = y + h / 2;
        const circle = this.add.graphics();
        const circleColor = isCompleted ? 0x44cc44 : (isUnlocked ? 0x4488ff : 0x444444);
        circle.fillStyle(circleColor, 0.35);
        circle.fillCircle(numX, numY, 16);
        card.add(circle);

        const numText = this.add.text(numX, numY, `${level.id}`, {
            fontSize: '18px', fill: isCompleted ? '#44cc44' : (isUnlocked ? '#4488ff' : '#666'),
            fontStyle: 'bold'
        }).setOrigin(0.5);
        card.add(numText);

        // Level name
        card.add(this.add.text(x + 44, y + 8, level.name, {
            fontSize: '14px', fill: isUnlocked ? '#fff' : '#888', fontStyle: 'bold'
        }));

        // Difficulty stars
        card.add(this.add.text(x + 44, y + 26, this.getDifficultyLabel(level), {
            fontSize: '10px', fill: isUnlocked ? '#999' : '#666'
        }));

        // Enemy HP stat
        card.add(this.add.text(x + 44, y + 40, `Enemy: ${level.aiMoundHealth} HP`, {
            fontSize: '10px', fill: isUnlocked ? '#bbb' : '#666'
        }));

        // Status icons on the right
        if (isCompleted) {
            card.add(this.add.text(x + w - 10, y + 10, '✓', {
                fontSize: '16px', fill: '#44cc44', fontStyle: 'bold'
            }).setOrigin(1, 0));
        } else if (!isUnlocked) {
            card.add(this.add.text(x + w - 10, y + h / 2, '🔒', {
                fontSize: '14px'
            }).setOrigin(0.5));
        }

        // Click zone
        const zone = this.add.zone(x + w / 2, y + h / 2, w, h);
        zone.setInteractive({ useHandCursor: isUnlocked });
        zone.setDepth(5);

        if (isUnlocked) {
            zone.on('pointerdown', () => {
                this.registry.set('currentLevel', level);
                this.scene.start('GameScene');
            });

            zone.on('pointerover', () => {
                bg.clear();
                bg.fillStyle(isCompleted ? 0x2a6a2a : 0x2a3a6a, 0.95);
                bg.lineStyle(2, isCompleted ? 0x66ee66 : 0x66aaff);
                bg.fillRoundedRect(x, y, w, h, 6);
                bg.strokeRoundedRect(x, y, w, h, 6);
            });

            zone.on('pointerout', () => {
                bg.clear();
                bg.fillStyle(bgColor, 0.88);
                bg.lineStyle(2, borderColor);
                bg.fillRoundedRect(x, y, w, h, 6);
                bg.strokeRoundedRect(x, y, w, h, 6);
            });
        }
    }

    getDifficultyLabel(level) {
        const diff = level.aiMoundHealth + level.aiStartFighters * 10 + level.aiStartMegas * 30;
        if (diff < 100) return '★☆☆☆☆';
        if (diff < 150) return '★★☆☆☆';
        if (diff < 200) return '★★★☆☆';
        if (diff < 280) return '★★★★☆';
        return '★★★★★';
    }
}
