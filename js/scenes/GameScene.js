// js/scenes/GameScene.js
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.playerMound = null;
        this.aiMound = null;
        this.playerAnts = null;
        this.aiAnts = null;
        this.foodSources = null;
        this.powerupButtons = [];
        this.fighterSpawnTimer = null;
        this.foodSpawnTimer = null;
        this.gameOverText = null;
        this.isGameOver = false;
        this.backgroundMusic = null;
        this.level = null; // Current level config
        this.levelUI = null; // Level display text
    }

    create() {
        console.log("GameScene create");
        this.isGameOver = false;

        // --- Load level configuration ---
        this.level = this.registry.get('currentLevel') || LEVELS[0];
        console.log(`Starting Level ${this.level.id}: ${this.level.name}`);

        try {
            this.sfxVolume = this.registry.get('sfxVolume') / 100;
            const musicVolume = this.registry.get('musicVolume') / 100;
            const musicKey = ASSETS.MUSIC_BACKGROUND;

            let existingMusic = this.sound.get(musicKey);
            let isMusicAlreadyPlaying = existingMusic && existingMusic.isPlaying;

            if (isMusicAlreadyPlaying) {
                this.backgroundMusic = existingMusic;
                this.backgroundMusic.setVolume(musicVolume);
                if (musicVolume <= 0) {
                    this.backgroundMusic.stop();
                }
            } else if (musicVolume > 0) {
                if (!this.sound.exists(musicKey)) {
                    console.error(`GameScene ERROR: Sound key '${musicKey}' not loaded!`);
                    return;
                }
                this.backgroundMusic = this.sound.add(musicKey, { loop: true, volume: musicVolume });
                this.backgroundMusic.once('locked', () => { });
                if (this.sound.context.state === 'running') {
                    this.backgroundMusic.play();
                } else {
                    this.input.once('pointerdown', () => {
                        if (this.sound.context.state === 'suspended') this.sound.resumeAll();
                        if (!this.backgroundMusic.isPlaying && this.registry.get('musicVolume') > 0) {
                            this.backgroundMusic.play();
                        }
                    }, this);
                }
            }
        } catch (error) {
            console.error("GameScene Error setting up background music:", error);
        }

        this.sound.play(ASSETS.SOUND_SFX_GAME_START, { volume: this.sfxVolume });

        // --- Background ---
        this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, ASSETS.BACKGROUND_TILE);
        this.background.setOrigin(0, 0);
        this.background.setDepth(-10);
        this.background.setTileScale(0.5);

        // --- Create Groups ---
        this.playerAnts = this.physics.add.group({ classType: Ant, runChildUpdate: true });
        this.aiAnts = this.physics.add.group({ classType: Ant, runChildUpdate: true });
        this.foodSources = this.physics.add.group({ classType: Food, runChildUpdate: false });
        this.projectiles = this.physics.add.group();

        // --- Create Mounds (using level-specific health) ---
        const centerX = GAME_WIDTH / 2;
        this.playerMound = new Mound(this, centerX, GAME_HEIGHT - 70, ASSETS.MOUND, true, null, this.level.playerMoundHealth);
        this.aiMound = new Mound(this, centerX, 70, ASSETS.MOUND, false, null, this.level.aiMoundHealth);
        this.playerMound.setEnemyMound(this.aiMound);
        this.aiMound.setEnemyMound(this.playerMound);

        // --- Give AI starting resources ---
        if (this.level.aiStartResources > 0) {
            this.aiMound.resources = this.level.aiStartResources;
        }

        // --- Level Banner (shows for 3 seconds then fades) ---
        this.showLevelBanner();

        // --- UI Setup ---
        this.createUI();

        // --- Initial Ants (level-specific) ---
        this.spawnInitialAnts();

        // --- Initial Food (level-specific) ---
        this.spawnInitialFood(this.level.initialFoodCount);

        // --- Timers (using level-specific intervals) ---
        this.fighterSpawnTimer = this.time.addEvent({
            delay: this.level.fighterSpawnInterval,
            callback: this.autoSpawnFighters,
            callbackScope: this,
            loop: true
        });

        this.foodSpawnTimer = this.time.addEvent({
            delay: this.level.foodSpawnInterval,
            callback: this.spawnFood,
            callbackScope: this,
            loop: true
        });

        // --- Powerup Buttons ---
        this.createPowerupButtons();

        // --- Collisions ---
        this.setupCollisions();

        // --- AI Timer (using level-specific interval) ---
        this.aiTimer = this.time.addEvent({
            delay: this.level.aiDecisionInterval,
            callback: this.runAI,
            callbackScope: this,
            loop: true
        });

        // --- Game Over Text (hidden) ---
        this.gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
            fontSize: '48px', fill: '#ff0000', fontStyle: 'bold', backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        console.log("GameScene creation complete.");
        this.updatePowerupButtons();
    }

    showLevelBanner() {
        const centerX = GAME_WIDTH / 2;
        const bannerY = GAME_HEIGHT / 2 - 40;

        // Semi-transparent overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, bannerY - 50, GAME_WIDTH, 100);
        overlay.setDepth(50);

        const levelText = this.add.text(centerX, bannerY - 15, `Level ${this.level.id}`, {
            fontSize: '18px',
            fill: '#ffcc00',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(51);

        const nameText = this.add.text(centerX, bannerY + 10, this.level.name, {
            fontSize: '26px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(51);

        const descText = this.add.text(centerX, bannerY + 35, this.level.description, {
            fontSize: '12px',
            fill: '#cccccc',
            fontStyle: 'italic',
            wordWrap: { width: GAME_WIDTH - 40 },
            align: 'center'
        }).setOrigin(0.5).setDepth(51);

        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: [overlay, levelText, nameText, descText],
                alpha: 0,
                duration: 800,
                onComplete: () => {
                    overlay.destroy();
                    levelText.destroy();
                    nameText.destroy();
                    descText.destroy();
                }
            });
        });
    }

    createUI() {
        const uiLeftMargin = 15;
        const uiVerticalPadding = 5;
        const uiFontSize = '16px';
        const uiLineHeight = 20;
        const uiElementCount = 2;
        const totalUiHeight = uiElementCount * uiLineHeight + (uiElementCount - 1) * uiVerticalPadding;
        let uiCurrentY = (GAME_HEIGHT / 2) - (totalUiHeight / 2) + (uiLineHeight / 2);
        const uiFixedX = uiLeftMargin;

        // Health Info Icon
        const healthBgIconX = uiLeftMargin;
        const healthBgIcon = this.add.image(healthBgIconX - 10, uiCurrentY - 50, ASSETS.HEALTH_INFO).setOrigin(0, 0.5);
        healthBgIcon.setDepth(8);

        const healthIconX = uiLeftMargin;
        const healthIcon = this.add.image(healthIconX + 10, uiCurrentY - 57, ASSETS.HEART).setOrigin(0, 0.5);
        healthIcon.setDepth(9);

        this.playerMound.healthText = this.add.text(
            uiFixedX, uiCurrentY - 40,
            stringUtils.leftFill(this.playerMound.health, 3, '0'),
            { fontSize: uiFontSize, fill: '#000000', fontStyle: 'bold' }
        ).setOrigin(0, 0.5);
        this.playerMound.healthText.setDepth(10);

        uiCurrentY += uiLineHeight + uiVerticalPadding;

        const resourceBgIconX = uiLeftMargin;
        const resourceBgIcon = this.add.image(resourceBgIconX - 10, uiCurrentY, ASSETS.FOOD_INFO).setOrigin(0, 0.5);
        resourceBgIcon.setDepth(8);

        const resourceIconX = uiLeftMargin;
        const resourceIcon = this.add.image(resourceIconX + 12, uiCurrentY - 7, ASSETS.FOOD).setOrigin(0, 0.5);
        resourceIcon.setDepth(9);

        this.playerMound.resourceText = this.add.text(
            uiFixedX - 2, uiCurrentY + 7,
            stringUtils.leftFill(this.playerMound.resources, 4, "0"),
            { fontSize: uiFontSize, fill: '#000000', fontStyle: 'bold' }
        ).setOrigin(0, 0.5);
        this.playerMound.resourceText.setDepth(10);
    }

    spawnInitialAnts() {
        console.log("Spawning initial ants...");
        const lv = this.level;

        // Player ants
        for (let i = 0; i < lv.playerStartFighters; i++) {
            let ant = this.playerMound.spawnAnt(FighterAnt);
            if (ant) this.playerAnts.add(ant);
        }
        for (let i = 0; i < lv.playerStartGatherers; i++) {
            let ant = this.playerMound.spawnAnt(GathererAnt);
            if (ant) this.playerAnts.add(ant);
        }

        // AI ants
        for (let i = 0; i < lv.aiStartFighters; i++) {
            let ant = this.aiMound.spawnAnt(FighterAnt);
            if (ant) this.aiAnts.add(ant);
        }
        for (let i = 0; i < lv.aiStartGatherers; i++) {
            let ant = this.aiMound.spawnAnt(GathererAnt);
            if (ant) this.aiAnts.add(ant);
        }
        for (let i = 0; i < lv.aiStartMegas; i++) {
            let ant = this.aiMound.spawnAnt(MegaFighterAnt);
            if (ant) this.aiAnts.add(ant);
        }

        console.log("Initial ants spawned.");
    }

    spawnInitialFood(count) {
        console.log(`Spawning ${count} initial food items...`);
        for (let i = 0; i < count; i++) {
            this.spawnFood();
        }
    }

    spawnSandTornado(sourceMound, targetMound) {
        console.log(`Spawning sand tornado from ${sourceMound.isPlayer ? 'Player' : 'AI'}`);
        const spawnOffsetY = sourceMound.isPlayer ? -30 : 30;
        const startX = sourceMound.x;
        const startY = sourceMound.y + spawnOffsetY;

        const tornado = this.projectiles.create(startX, startY, ASSETS.SAND_TORNADO);
        if (!tornado) return;

        tornado.setOrigin(0.5, 0.5);
        this.physics.moveToObject(tornado, targetMound, SAND_TORNADO_SPEED);

        const overlapCollider = this.physics.add.overlap(
            tornado, targetMound,
            (tornadoSprite, mound) => {
                tornadoSprite.destroy();
                this.physics.world.removeCollider(overlapCollider);
            },
            (tornadoSprite, mound) => tornadoSprite.active && mound.active,
            this
        );
    }

    spawnFood() {
        if (this.isGameOver) return;

        const currentFoodCount = this.foodSources.countActive(true);
        if (currentFoodCount >= this.level.maxFoodSources && currentFoodCount > 0) {
            return;
        }

        const paddingY = GAME_HEIGHT * 0.20;
        const paddingX = 50;
        const x = Phaser.Math.Between(paddingX, GAME_WIDTH - paddingX);
        const y = Phaser.Math.Between(paddingY, GAME_HEIGHT - paddingY);

        let tooClose = false;
        this.foodSources.getChildren().forEach(existingFood => {
            if (existingFood.active) {
                const dist = Phaser.Math.Distance.Between(x, y, existingFood.x, existingFood.y);
                if (dist < 20) tooClose = true;
            }
        });

        if (!tooClose) {
            const food = new Food(this, x, y);
            this.foodSources.add(food);
        }
    }

    autoSpawnFighters() {
        if (this.isGameOver) return;
        if (!this.level.aiFighterAutoSpawn) return;

        let pAnt = this.playerMound.spawnAnt(FighterAnt);
        let aAnt = this.aiMound.spawnAnt(FighterAnt);
        if (pAnt) this.playerAnts.add(pAnt);
        if (aAnt) this.aiAnts.add(aAnt);
    }

    createPowerupButtons() {
        const buttonWidth = 60;
        const buttonHeight = 40;
        const verticalPadding = 15;
        const rightMargin = 10;
        const buttonFixedX = GAME_WIDTH - (buttonWidth / 2) - rightMargin;

        const totalButtonHeight = 4 * buttonHeight;
        const totalSpacingHeight = 3 * verticalPadding;
        const totalGroupHeight = totalButtonHeight + totalSpacingHeight;
        let currentY = (GAME_HEIGHT / 2) - (totalGroupHeight / 2) + (buttonHeight / 2);

        this.powerupButtons = [];

        this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Gatherer', POWERUP_COSTS.GATHERER, ASSETS.POWERUP_BG, () => this.buyPowerup('GATHERER')));
        currentY += buttonHeight + verticalPadding;

        this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Fighter', POWERUP_COSTS.FIGHTER, ASSETS.POWERUP_BG, () => this.buyPowerup('FIGHTER')));
        currentY += buttonHeight + verticalPadding;

        this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Mega', POWERUP_COSTS.MEGA_FIGHTER, ASSETS.POWERUP_BG, () => this.buyPowerup('MEGA_FIGHTER')));
        currentY += buttonHeight + verticalPadding;

        this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Bomb', POWERUP_COSTS.SAND_BOMB, ASSETS.POWERUP_BG, () => this.buyPowerup('SAND_BOMB')));

        this.updatePowerupButtons();
    }

    updatePowerupButtons() {
        if (!this.playerMound || this.isGameOver) return;
        const resources = this.playerMound.resources;
        const limits = {
            purchasedGatherers: this.playerMound.antCounts.purchasedGatherers,
            purchasedFighters: this.playerMound.antCounts.purchasedFighters
        };
        this.powerupButtons.forEach(button => button.updateEnabled(resources, limits));
    }

    buyPowerup(type) {
        if (this.isGameOver || !this.playerMound) return;

        console.log(`Player attempting to buy: ${type}`);
        let cost = 0;
        let antClass = null;
        let purchased = false;

        switch (type) {
            case 'GATHERER':
                if (this.playerMound.antCounts.purchasedGatherers < MAX_ANTS.GATHERER) {
                    cost = POWERUP_COSTS.GATHERER;
                    antClass = GathererAnt;
                    purchased = true;
                } else {
                    return;
                }
                break;
            case 'FIGHTER':
                if (this.playerMound.antCounts.purchasedFighters < MAX_ANTS.FIGHTER) {
                    cost = POWERUP_COSTS.FIGHTER;
                    antClass = FighterAnt;
                    purchased = true;
                } else {
                    return;
                }
                break;
            case 'MEGA_FIGHTER':
                cost = POWERUP_COSTS.MEGA_FIGHTER;
                antClass = MegaFighterAnt;
                purchased = false;
                break;
            case 'SAND_BOMB':
                cost = POWERUP_COSTS.SAND_BOMB;
                if (this.playerMound.spendResources(cost)) {
                    this.aiMound.takeDamage(SAND_BOMB_DAMAGE);
                    this.spawnSandTornado(this.playerMound, this.aiMound);
                }
                return;
        }

        if (antClass && cost > 0) {
            if (this.playerMound.spendResources(cost)) {
                let ant = this.playerMound.spawnAnt(antClass, purchased);
                if (ant) {
                    this.playerAnts.add(ant);
                } else {
                    this.playerMound.addResources(cost);
                }
            }
        }
        this.updatePowerupButtons();
    }

    setupCollisions() {
        this.physics.add.overlap(this.playerAnts, this.aiAnts, this.handleAntVsAntCollision, null, this);
        this.physics.add.overlap(this.playerAnts, this.aiMound, this.handleAntVsMoundCollision, null, this);
        this.physics.add.overlap(this.aiAnts, this.playerMound, this.handleAntVsMoundCollision, null, this);
        this.physics.add.overlap(this.playerAnts, this.foodSources, this.handleGathererVsFoodCollision, null, this);
        this.physics.add.overlap(this.aiAnts, this.foodSources, this.handleGathererVsFoodCollision, null, this);
        this.physics.add.overlap(this.playerAnts, this.playerMound, this.handleGathererVsHomeMoundCollision, null, this);
        this.physics.add.overlap(this.aiAnts, this.aiMound, this.handleGathererVsHomeMoundCollision, null, this);
    }

    // --- Collision Handlers ---

    handleAntVsAntCollision(ant1, ant2) {
        if (!ant1.active || !ant2.active) return;
        if (ant1.ownerMound === ant2.ownerMound) return;
        if (ant1 instanceof GathererAnt || ant2 instanceof GathererAnt) return;

        if (ant1.isMega && ant2.isMega) {
            ant1.destroyAnt();
            ant2.destroyAnt();
        } else if (ant1.isMega && !ant2.isMega) {
            ant2.destroyAnt();
        } else if (!ant1.isMega && ant2.isMega) {
            ant1.destroyAnt();
        } else if (ant1 instanceof FighterAnt && ant2 instanceof FighterAnt) {
            ant1.destroyAnt();
            ant2.destroyAnt();
        }
    }

    handleAntVsMoundCollision(mound, ant) {
        if (!(mound instanceof Mound)) [mound, ant] = [ant, mound];
        if (!ant || !ant.active || !mound || !mound.active || !(mound instanceof Mound) || !(ant instanceof Ant)) return;
        if (ant.ownerMound === mound) return;

        if (ant instanceof FighterAnt || ant instanceof MegaFighterAnt) {
            mound.takeDamage(ant.damage);
            ant.destroyAnt();
        } else if (ant instanceof GathererAnt) {
            ant.body?.setVelocity(0, 0);
            ant.setTarget(null);
        }
    }

    handleGathererVsFoodCollision(ant, food) {
        if (!ant.active || !food.active) return;
        if (ant instanceof GathererAnt && !ant.carryingFood) {
            if (ant.target === food || !ant.target || !ant.target.active) {
                ant.collectFood(food);
            }
        }
    }

    handleGathererVsHomeMoundCollision(mound, ant) {
        if (!ant.active || !mound.active) return;
        if (ant instanceof GathererAnt && ant.carryingFood && ant.ownerMound === mound) {
            ant.dropOffFood();
        }
    }

    // --- AI Logic (level-tuned) ---
    runAI() {
        if (this.isGameOver || !this.aiMound) return;

        const ai = this.aiMound;
        const res = ai.resources;
        const counts = ai.antCounts;
        const aggro = this.level.aiAggressiveness;
        let purchasedSomething = false;

        // Priority 1: Sand Bomb
        if (res >= POWERUP_COSTS.SAND_BOMB && this.playerMound.health > 50 && Math.random() < this.level.aiBombChance * aggro) {
            if (ai.spendResources(POWERUP_COSTS.SAND_BOMB)) {
                this.playerMound.takeDamage(SAND_BOMB_DAMAGE);
                this.spawnSandTornado(this.aiMound, this.playerMound);
                purchasedSomething = true;
            }
        }

        // Priority 2: Mega Fighter
        if (!purchasedSomething && res >= POWERUP_COSTS.MEGA_FIGHTER && Math.random() < this.level.aiMegaChance * aggro) {
            if (ai.spendResources(POWERUP_COSTS.MEGA_FIGHTER)) {
                let ant = ai.spawnAnt(MegaFighterAnt);
                if (ant) this.aiAnts.add(ant);
                purchasedSomething = true;
            }
        }

        // Priority 3: Gatherers
        if (!purchasedSomething && counts.purchasedGatherers < MAX_ANTS.GATHERER && res >= POWERUP_COSTS.GATHERER && Math.random() < this.level.aiGathererChance * aggro) {
            if (ai.spendResources(POWERUP_COSTS.GATHERER)) {
                let ant = ai.spawnAnt(GathererAnt, true);
                if (ant) this.aiAnts.add(ant);
                purchasedSomething = true;
            }
        }

        // Priority 4: Fighters
        if (!purchasedSomething && counts.purchasedFighters < MAX_ANTS.FIGHTER && res >= POWERUP_COSTS.FIGHTER && Math.random() < this.level.aiFighterChance * aggro) {
            if (ai.spendResources(POWERUP_COSTS.FIGHTER)) {
                let ant = ai.spawnAnt(FighterAnt, true);
                if (ant) this.aiAnts.add(ant);
                purchasedSomething = true;
            }
        }
    }

    // --- Game Over / Level Complete ---
    gameOver(message) {
        if (this.isGameOver) return;

        console.log("GAME OVER:", message);
        this.isGameOver = true;

        // Play sound
        if (message.indexOf("Player") > -1) {
            this.sound.play(ASSETS.SOUND_SFX_GAME_WON, { volume: this.sfxVolume });
        } else {
            this.sound.play(ASSETS.SOUND_SFX_GAME_LOST, { volume: this.sfxVolume });
        }

        // Stop music
        let currentMusic = this.sound.get(ASSETS.MUSIC_BACKGROUND);
        if (currentMusic && currentMusic.isPlaying) {
            currentMusic.stop();
        }
        this.backgroundMusic = null;

        // Stop timers
        if (this.fighterSpawnTimer) this.fighterSpawnTimer.remove();
        if (this.foodSpawnTimer) this.foodSpawnTimer.remove();
        if (this.aiTimer) this.aiTimer.remove();

        // Stop all ants
        this.playerAnts.getChildren().forEach(ant => { if (ant.body) ant.body.setVelocity(0, 0); });
        this.aiAnts.getChildren().forEach(ant => { if (ant.body) ant.body.setVelocity(0, 0); });

        const playerWon = message.indexOf("Player") > -1;

        if (playerWon) {
            // --- Level Complete ---
            const currentLevel = this.level;
            const currentLevelIndex = LEVELS.findIndex(l => l.id === currentLevel.id);
            const nextLevelIndex = currentLevelIndex + 1;
            const nextLevel = nextLevelIndex < LEVELS.length ? LEVELS[nextLevelIndex] : null;

            // Unlock next level
            const maxUnlocked = this.registry.get('maxUnlockedLevel') || 1;
            if (nextLevel && nextLevel.id > maxUnlocked) {
                this.registry.set('maxUnlockedLevel', nextLevel.id);
                GameSave.set('maxUnlockedLevel', nextLevel.id);
            }

            // Store data for LevelCompleteScene
            this.registry.set('completedLevel', currentLevel);
            this.registry.set('nextLevel', nextLevel);
            this.registry.set('playerHPAtEnd', this.playerMound.health);
            this.registry.set('aiHPAtEnd', this.aiMound.health);

            // Transition after brief delay
            this.time.delayedCall(1500, () => {
                this.scene.start('LevelCompleteScene');
            });
        } else {
            // --- Defeat ---
            this.registry.set('failedLevel', this.level);
            this.registry.set('playerHPAtEnd', this.playerMound.health);
            this.registry.set('aiHPAtEnd', this.aiMound.health);

            this.time.delayedCall(1500, () => {
                this.scene.start('GameOverScene');
            });
        }
    }

    update(time, delta) {
        if (this.isGameOver) return;

        // Minimum food guarantee (using level-specific max)
        if (this.foodSources && this.foodSources.countActive(true) === 0) {
            this.spawnFood();
            this.spawnFood();
        }

        // Prune dead ants
        if (this.playerMound) this.playerMound.ants = this.playerMound.ants.filter(ant => ant.active);
        if (this.aiMound) this.aiMound.ants = this.aiMound.ants.filter(ant => ant.active);
    }
}
