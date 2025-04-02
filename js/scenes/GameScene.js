// js/scenes/GameScene.js
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.playerMound = null;
        this.aiMound = null;
        this.playerAnts = null; // Combined group for player ants
        this.aiAnts = null;     // Combined group for AI ants
        this.foodSources = null;
        this.powerupButtons = [];
        this.fighterSpawnTimer = null;
        this.foodSpawnTimer = null;
        this.gameOverText = null;
        this.isGameOver = false;
    }

    create() {
        console.log("GameScene create");
        this.isGameOver = false;

        
    // Create a TileSprite that covers the entire game area
    // It will automatically repeat the ASSETS.BACKGROUND_TILE texture
    this.background = this.add.tileSprite(
        0,              // Start x coordinate
        0,              // Start y coordinate
        GAME_WIDTH,     // Width of the game screen
        GAME_HEIGHT,    // Height of the game screen
        ASSETS.BACKGROUND_TILE // The key of the texture to tile
    );
    // Set the origin to the top-left corner (0, 0) so it fills the screen correctly
    this.background.setOrigin(0, 0);
    // Optionally set depth to be absolutely sure it's behind everything
    this.background.setDepth(-10); // A low number ensures it's in the back
    this.background.setTileScale(0.5); // Set the scale of the tiles, adjust as needed

        // --- Create Groups ---
        // Using generic groups first, can specialize later if needed
        this.playerAnts = this.physics.add.group({ classType: Ant, runChildUpdate: true });
        this.aiAnts = this.physics.add.group({ classType: Ant, runChildUpdate: true });
        this.foodSources = this.physics.add.group({ classType: Food, runChildUpdate: false }); // Food doesn't need update
        this.projectiles = this.physics.add.group();

        // --- Create Mounds ---
        const centerX = GAME_WIDTH / 2;
        this.playerMound = new Mound(this, centerX, GAME_HEIGHT - 70, ASSETS.MOUND, true, null);
        this.aiMound = new Mound(this, centerX, 70, ASSETS.MOUND, false, null);
        this.playerMound.setEnemyMound(this.aiMound);
        this.aiMound.setEnemyMound(this.playerMound);


        // --- Initial Ants ---
        this.spawnInitialAnts();

        // --- Initial Food ---
        this.spawnInitialFood(5); // Start with 5 food items

        // --- Timers ---
        // Auto-spawn fighter ants
        this.fighterSpawnTimer = this.time.addEvent({
            delay: FIGHTER_SPAWN_INTERVAL,
            callback: this.autoSpawnFighters,
            callbackScope: this,
            loop: true
        });
        // Spawn food periodically
        this.foodSpawnTimer = this.time.addEvent({
            delay: FOOD_SPAWN_INTERVAL,
            callback: this.spawnFood,
            callbackScope: this,
            loop: true
        });

        // --- UI ---
        this.createPowerupButtons();

        // --- Collisions ---
        this.setupCollisions();

        // --- AI Timer ---
        this.aiTimer = this.time.addEvent({
            delay: 3000, // AI makes decisions every 3 seconds
            callback: this.runAI,
            callbackScope: this,
            loop: true
        });

         // --- Game Over Text (Hidden initially) ---
         this.gameOverText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '', {
            fontSize: '48px', fill: '#ff0000', fontStyle: 'bold', backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(100).setVisible(false);

        console.log("GameScene creation complete.");
         this.updatePowerupButtons(); // Initial check
    }

     spawnInitialAnts() {
         console.log("Spawning initial ants...");
         // Player
         let pFighter1 = this.playerMound.spawnAnt(FighterAnt);
         let pFighter2 = this.playerMound.spawnAnt(FighterAnt);
         let pGatherer = this.playerMound.spawnAnt(GathererAnt);
         if (pFighter1) this.playerAnts.add(pFighter1);
         if (pFighter2) this.playerAnts.add(pFighter2);
         if (pGatherer) this.playerAnts.add(pGatherer);

         // AI
         let aFighter1 = this.aiMound.spawnAnt(FighterAnt);
         let aFighter2 = this.aiMound.spawnAnt(FighterAnt);
         let aGatherer = this.aiMound.spawnAnt(GathererAnt);
          if (aFighter1) this.aiAnts.add(aFighter1);
          if (aFighter2) this.aiAnts.add(aFighter2);
          if (aGatherer) this.aiAnts.add(aGatherer);
          console.log("Initial ants spawned.");
     }


    spawnInitialFood(count) {
        console.log(`Spawning ${count} initial food items...`);
        for (let i = 0; i < count; i++) {
            this.spawnFood();
        }
    }


    spawnSandTornado(sourceMound, targetMound) {
        console.log(`Spawning sand tornado from ${sourceMound.isPlayer ? 'Player' : 'AI'} towards ${targetMound.isPlayer ? 'Player' : 'AI'}`);

        // Determine spawn offset based on source
        const spawnOffsetX = 0; // Can adjust if needed
        const spawnOffsetY = sourceMound.isPlayer ? -30 : 30; // Slightly above player, below AI

        const startX = sourceMound.x + spawnOffsetX;
        const startY = sourceMound.y + spawnOffsetY;

        // Create the tornado sprite using physics
        const tornado = this.projectiles.create(startX, startY, ASSETS.SAND_TORNADO);
        if (!tornado) {
            console.error("Failed to create tornado sprite.");
            return;
        }

        tornado.setOrigin(0.5, 0.5); // Adjust if needed for your sprite
        // Optional: Add slight rotation or scaling effect later
        // tornado.setRotation(Phaser.Math.DegToRad(Math.random() * 360));

        // Set it moving towards the target mound
        this.physics.moveToObject(tornado, targetMound, SAND_TORNADO_SPEED);

        // --- Collision detection for the tornado hitting the target ---
        // We add an overlap check specifically for THIS tornado instance and the target
        const overlapCollider = this.physics.add.overlap(
            tornado,
            targetMound,
            (tornadoSprite, mound) => { // Callback function on hit
                console.log("Sand tornado reached target mound.");

                // --- Actions on Hit ---
                // 1. Destroy the tornado sprite
                tornadoSprite.destroy();

                // 2. Optional: Add impact effect (particles, screen shake)
                // this.cameras.main.shake(100, 0.01);
                // Add particle emitter here if desired

                // 3. Remove the specific collider we created to avoid memory leaks
                this.physics.world.removeCollider(overlapCollider);

                // Note: The actual damage is applied instantly when the powerup
                // is activated, the visual is just for show.
            },
            (tornadoSprite, mound) => {
                // Process callback: Only allow collision if both objects are active
                return tornadoSprite.active && mound.active;
            },
            this // Context
        );
    }

    spawnFood() {
    if (this.isGameOver) return;

    const currentFoodCount = this.foodSources.countActive(true);

    // Prevent over-spawning ONLY if the current count is already >= MAX
    // AND the count is greater than zero (meaning we aren't trying to fulfill the minimum=1 requirement)
    if (currentFoodCount >= MAX_FOOD_SOURCES && currentFoodCount > 0) {
        // console.log("Max food sources reached, skipping spawn."); // Optional log
        return;
    }

    // Spawn food away from mounds
    const paddingY = GAME_HEIGHT * 0.20;
    const paddingX = 50;
    const x = Phaser.Math.Between(paddingX, GAME_WIDTH - paddingX);
    const y = Phaser.Math.Between(paddingY, GAME_HEIGHT - paddingY);

    // Check proximity (this logic remains good)
    let tooClose = false;
    this.foodSources.getChildren().forEach(existingFood => {
        if (existingFood.active) {
            const dist = Phaser.Math.Distance.Between(x, y, existingFood.x, existingFood.y);
            if (dist < 20) {
                tooClose = true;
            }
        }
    });

    if (!tooClose) {
        const food = new Food(this, x, y);
        this.foodSources.add(food);
        // console.log("Spawned food at:", x, y, " | Current count:", this.foodSources.countActive(true)); // Optional log
    } else {
         // console.log("Skipped food spawn - too close to existing.");
         // Optionally, try spawning again immediately in the next frame if needed by the update loop?
         // For now, let the update loop or timer handle the next attempt.
    }
    }

    autoSpawnFighters() {
        if (this.isGameOver) return;
        console.log("Auto-spawning fighters...");
         let pAnt = this.playerMound.spawnAnt(FighterAnt);
         let aAnt = this.aiMound.spawnAnt(FighterAnt);
         if (pAnt) this.playerAnts.add(pAnt);
         if (aAnt) this.aiAnts.add(aAnt);
    }

    // js/scenes/GameScene.js

    createPowerupButtons() {
    // --- Configuration for Vertical Layout on the Right ---
    const buttonWidth = 60; // Approximate width of your powerup_bg asset
    const buttonHeight = 40; // Approximate height of your powerup_bg asset
    const verticalPadding = 15; // Pixels between buttons vertically
    const rightMargin = 10; // Pixels from the right edge of the screen

    const buttonFixedX = GAME_WIDTH - (buttonWidth / 2) - rightMargin; // X position for the center of the buttons

    const totalButtonHeight = (this.powerupButtons.length === 0 ? 4 : this.powerupButtons.length) * buttonHeight; // Estimate based on 4 buttons initially
    const totalSpacingHeight = (this.powerupButtons.length === 0 ? 3 : this.powerupButtons.length - 1) * verticalPadding; // Estimate based on 4 buttons initially
    const totalGroupHeight = totalButtonHeight + totalSpacingHeight;

    // Calculate starting Y to center the group vertically
    let currentY = (GAME_HEIGHT / 2) - (totalGroupHeight / 2) + (buttonHeight / 2); // Start Y for the center of the *first* button


    // --- Create Buttons Vertically ---
    this.powerupButtons = []; // Clear any previous buttons if this function were called again

    // Gatherer Button
    this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Gatherer', POWERUP_COSTS.GATHERER, ASSETS.POWERUP_BG, () => this.buyPowerup('GATHERER')));
    currentY += buttonHeight + verticalPadding; // Move down for the next button

    // Fighter Button
    this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Fighter', POWERUP_COSTS.FIGHTER, ASSETS.POWERUP_BG, () => this.buyPowerup('FIGHTER')));
    currentY += buttonHeight + verticalPadding; // Move down

    // Mega Button
    this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Mega', POWERUP_COSTS.MEGA_FIGHTER, ASSETS.POWERUP_BG, () => this.buyPowerup('MEGA_FIGHTER')));
    currentY += buttonHeight + verticalPadding; // Move down

    // Bomb Button
    this.powerupButtons.push(new PowerupButton(this, buttonFixedX, currentY, 'Bomb', POWERUP_COSTS.SAND_BOMB, ASSETS.POWERUP_BG, () => this.buyPowerup('SAND_BOMB')));
    // No increment needed after the last button

    // Ensure they are enabled/disabled correctly from the start
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
        let purchased = false; // Flag to track if it's a purchasable ant type for limits

        switch (type) {
            case 'GATHERER':
                 if (this.playerMound.antCounts.purchasedGatherers < MAX_ANTS.GATHERER) {
                     cost = POWERUP_COSTS.GATHERER;
                     antClass = GathererAnt;
                     purchased = true;
                 } else {
                      console.log("Gatherer limit reached.");
                      return; // Don't proceed if limit hit
                 }
                break;
            case 'FIGHTER':
                 if (this.playerMound.antCounts.purchasedFighters < MAX_ANTS.FIGHTER) {
                     cost = POWERUP_COSTS.FIGHTER;
                     antClass = FighterAnt;
                     purchased = true;
                 } else {
                     console.log("Fighter limit reached.");
                     return; // Don't proceed if limit hit
                 }
                break;
            case 'MEGA_FIGHTER':
                cost = POWERUP_COSTS.MEGA_FIGHTER;
                antClass = MegaFighterAnt;
                 purchased = false; // Mega fighters don't have a purchase limit in this design
                break;
            case 'SAND_BOMB':
                cost = POWERUP_COSTS.SAND_BOMB;
                if (this.playerMound.spendResources(cost)) {
                    console.log("Player used Sand Bomb!");
                    this.aiMound.takeDamage(SAND_BOMB_DAMAGE);
                    // Add visual effect for bomb later
                    this.spawnSandTornado(this.playerMound, this.aiMound);
                    // Add sound effect here? this.sound.play('sand_bomb_sound');
                } else {
                     console.log("Not enough resources for Sand Bomb");
                }
                return; // Handled differently
        }

        if (antClass && cost > 0) {
            if (this.playerMound.spendResources(cost)) {
                console.log(`Player bought ${type}`);
                 // Pass purchased flag to spawnAnt
                 let ant = this.playerMound.spawnAnt(antClass, purchased);
                 if (ant) {
                     this.playerAnts.add(ant);
                 } else {
                      // Refund if spawn failed unexpectedly (shouldn't happen with checks)
                      console.error("Spawn failed after spending resources, refunding.");
                      this.playerMound.addResources(cost); // Give back resources
                 }
            } else {
                 console.log(`Not enough resources for ${type}`);
            }
        }
         this.updatePowerupButtons(); // Update buttons after purchase attempt
    }


    setupCollisions() {
        console.log("Setting up collisions...");
        // --- Ant vs Ant Collisions ---
        this.physics.add.overlap(this.playerAnts, this.aiAnts, this.handleAntVsAntCollision, null, this);

        // --- Ant vs Enemy Mound Collisions ---
        this.physics.add.overlap(this.playerAnts, this.aiMound, this.handleAntVsMoundCollision, null, this);
        this.physics.add.overlap(this.aiAnts, this.playerMound, this.handleAntVsMoundCollision, null, this);

        // --- Gatherer vs Food Collisions ---
        // Need to check ant type inside the handler
        this.physics.add.overlap(this.playerAnts, this.foodSources, this.handleGathererVsFoodCollision, null, this);
        this.physics.add.overlap(this.aiAnts, this.foodSources, this.handleGathererVsFoodCollision, null, this);

        // --- Gatherer vs Home Mound Collisions (for dropping off food) ---
        // Need to check ant type inside the handler
        this.physics.add.overlap(this.playerAnts, this.playerMound, this.handleGathererVsHomeMoundCollision, null, this);
        this.physics.add.overlap(this.aiAnts, this.aiMound, this.handleGathererVsHomeMoundCollision, null, this);

        console.log("Collisions set up.");
    }

    // --- Collision Handlers ---

    handleAntVsAntCollision(ant1, ant2) {
    if (!ant1.active || !ant2.active) return;
    if (ant1.ownerMound === ant2.ownerMound) return;

    // --- GATHERERS ARE INDESTRUCTIBLE IN COMBAT ---
    // If either ant involved in the collision is a GathererAnt, do nothing.
    // They completely ignore all other ants in combat scenarios.
    if (ant1 instanceof GathererAnt || ant2 instanceof GathererAnt) {
         // Optional Log: console.log(`Collision ignored: Involving Gatherer`);
        return; // Exit the function, no interaction happens
    }
    // --- End Gatherer Ignore Logic ---

    // --- Logic now only applies to Fighter vs Fighter, Mega vs Fighter, Mega vs Mega ---

    // Mega vs Mega = both die
    if (ant1.isMega && ant2.isMega) {
        console.log("Mega vs Mega collision");
        // Since only Fighters/Megas reach here, both must be Mega
        ant1.destroyAnt();
        ant2.destroyAnt();
    }
    // Mega vs Normal Fighter = normal dies
    else if (ant1.isMega && !ant2.isMega) { // ant2 must be Fighter
        console.log("Mega vs Fighter collision");
        ant2.destroyAnt(); // Destroy the Fighter
    } else if (!ant1.isMega && ant2.isMega) { // ant1 must be Fighter
        console.log("Fighter vs Mega collision");
        ant1.destroyAnt(); // Destroy the Fighter
    }
    // Fighter vs Fighter = both die
    else if (ant1 instanceof FighterAnt && ant2 instanceof FighterAnt) {
         console.log("Fighter vs Fighter collision");
         ant1.destroyAnt();
         ant2.destroyAnt();
    }
    else {
        // This case should ideally not be reached if only Fighters/Megas get past the Gatherer check
        console.warn(`Unhandled ant vs ant collision (Post-Gatherer Check): ${ant1.constructor.name} vs ${ant2.constructor.name}`);
    }
    }

    handleAntVsMoundCollision(mound, ant) {
    if (!(mound instanceof Mound)) [mound, ant] = [ant, mound];
    if (!ant || !ant.active || !mound || !mound.active || !(mound instanceof Mound) || !(ant instanceof Ant)) return;

    // If ant reaches its OWN mound, this handler should ignore it
    // (Gatherer drop-off is handled by handleGathererVsHomeMoundCollision)
    if (ant.ownerMound === mound) return;

    // --- Ant is hitting an ENEMY mound ---

    // Only Fighters and Mega Fighters damage mounds
    if (ant instanceof FighterAnt || ant instanceof MegaFighterAnt) {
        console.log(`Ant ${ant.constructor.name} hit ENEMY mound ${mound.isPlayer ? 'Player' : 'AI'}`);
        mound.takeDamage(ant.damage);
        ant.destroyAnt(); // Fighter/Mega gets destroyed after attacking mound
    }
    // Gatherers hitting enemy mound just get stopped/pass through (no destruction)
    else if (ant instanceof GathererAnt) {
        console.log(`Gatherer hit ENEMY mound ${mound.isPlayer ? 'Player' : 'AI'} - Ignoring/Blocking.`);
        // Option 1: Stop the ant completely
        ant.body?.setVelocity(0, 0);
        ant.setTarget(null); // Lose target
        // Option 2: Let physics handle overlap (they might just push past slightly or get stuck)
        // Option 3: Destroy the gatherer (if you decide they *should* die here after all)
        // ant.destroyAnt(); // Uncomment if they should die here
    }
     else {
         // Other ant types? Currently none.
         console.warn(`Unknown ant type ${ant.constructor.name} hit ENEMY mound.`);
         ant.destroyAnt(); // Default: destroy unknown types?
     }
    }

    handleGathererVsFoodCollision(ant, food) {
        if (!ant.active || !food.active) return;

        // Check if the ant is a Gatherer and is NOT currently carrying food
        if (ant instanceof GathererAnt && !ant.carryingFood) {
            // Check if the food is its current target or if it needs a new target
             if (ant.target === food || !ant.target || !ant.target.active) {
                 ant.collectFood(food); // collectFood handles destroying the food sprite
             }
             // If the gatherer bumped into food it wasn't targetting, it might ignore it
             // or retarget - current logic focuses on targetted food.
        }
    }

    handleGathererVsHomeMoundCollision(mound, ant) {
         if (!ant.active || !mound.active) return;

        // Check if it's a Gatherer, it IS carrying food, and it reached ITS OWN mound
        if (ant instanceof GathererAnt && ant.carryingFood && ant.ownerMound === mound) {
             ant.dropOffFood();
        }
    }

    handleGathererVsHomeMoundCollision(mound, ant) {
     if (!ant.active || !mound.active) return;

     // Check if it's a Gatherer, it IS carrying food, and it reached ITS OWN mound
     if (ant instanceof GathererAnt && ant.carryingFood && ant.ownerMound === mound) {
         // *** Add log for collision handler trigger ***
         console.log(`HANDLER: Gatherer [${ant.x.toFixed(0)},${ant.y.toFixed(0)}] collided with HOME MOUND [${mound.x.toFixed(0)},${mound.y.toFixed(0)}]`);
         ant.dropOffFood();
     }
    }

    // --- AI Logic ---
    runAI() {
        if (this.isGameOver || !this.aiMound) return;

        const ai = this.aiMound;
        const res = ai.resources;
        const counts = ai.antCounts;

        // Simple Priority AI:
        // 1. Max out Gatherers first? (Maybe limit to 2 initially)
        // 2. Get Mega Fighters if affordable?
        // 3. Spam regular Fighters?
        // 4. Use Sand Bomb if very rich?

        // Decision order can be adjusted for different strategies
         let purchasedSomething = false;

        // Priority 1: Sand Bomb if affordable and maybe useful (e.g., player has high health?)
        if (res >= POWERUP_COSTS.SAND_BOMB && this.playerMound.health > 50 && Math.random() < 0.2) { // 20% chance if affordable
             if (ai.spendResources(POWERUP_COSTS.SAND_BOMB)) {
                 console.log("AI used Sand Bomb!");
                 this.playerMound.takeDamage(SAND_BOMB_DAMAGE);
                 this.spawnSandTornado(this.aiMound, this.playerMound);
                 purchasedSomething = true;
             }
        }

        // Priority 2: Mega Fighter if affordable
        if (!purchasedSomething && res >= POWERUP_COSTS.MEGA_FIGHTER && Math.random() < 0.4) { // 40% chance if affordable
             if (ai.spendResources(POWERUP_COSTS.MEGA_FIGHTER)) {
                 console.log("AI bought Mega Fighter");
                 let ant = ai.spawnAnt(MegaFighterAnt);
                 if (ant) this.aiAnts.add(ant);
                 purchasedSomething = true;
             }
        }


        // Priority 3: Maintain Gatherers if below max purchased and affordable
        if (!purchasedSomething && counts.purchasedGatherers < MAX_ANTS.GATHERER && res >= POWERUP_COSTS.GATHERER && Math.random() < 0.6) { // 60% chance
            if (ai.spendResources(POWERUP_COSTS.GATHERER)) {
                 console.log("AI bought Gatherer");
                 let ant = ai.spawnAnt(GathererAnt, true); // Mark as purchased
                 if (ant) this.aiAnts.add(ant);
                  purchasedSomething = true;
            }
        }

        // Priority 4: Buy Fighter if below max purchased and affordable
        if (!purchasedSomething && counts.purchasedFighters < MAX_ANTS.FIGHTER && res >= POWERUP_COSTS.FIGHTER && Math.random() < 0.7) { // 70% chance
            if (ai.spendResources(POWERUP_COSTS.FIGHTER)) {
                 console.log("AI bought Fighter");
                 let ant = ai.spawnAnt(FighterAnt, true); // Mark as purchased
                 if (ant) this.aiAnts.add(ant);
                  purchasedSomething = true;
            }
        }


        // Fallback: If still haven't done anything and have enough for a basic fighter (even if at limit, maybe?)
        // Let's stick to limits for now. AI will save resources if it can't buy anything useful.


        // Add more sophisticated logic later:
        // - React to player's army composition
        // - Save up for specific units
        // - Defend if attacked heavily
    }

    // --- Game Over ---
    gameOver(message) {
        if (this.isGameOver) return; // Prevent multiple triggers

        console.log("GAME OVER:", message);
        this.isGameOver = true;

        // Stop timers
        if (this.fighterSpawnTimer) this.fighterSpawnTimer.remove();
        if (this.foodSpawnTimer) this.foodSpawnTimer.remove();
        if (this.aiTimer) this.aiTimer.remove();

        // Stop all ants
        this.playerAnts.getChildren().forEach(ant => ant.body.setVelocity(0, 0));
        this.aiAnts.getChildren().forEach(ant => ant.body.setVelocity(0, 0));

        // Display game over message
        this.gameOverText.setText(message);
        this.gameOverText.setVisible(true);

         // Optionally, add a restart button
         this.time.delayedCall(3000, () => { // After 3 seconds
              this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, 'Click to Restart', {
                  fontSize: '24px', fill: '#ffff00', backgroundColor: '#000000'
              })
              .setOrigin(0.5)
              .setInteractive({ useHandCursor: true })
              .on('pointerdown', () => this.scene.restart());
          });
    }


    update(time, delta) {
        if (this.isGameOver) return;

        // min food check - Ensure at least 1 food source is available
        if (this.foodSources && this.foodSources.countActive(true) === 0) {
            console.log("GUARANTEE_MIN_FOOD: Count is zero, attempting spawn.");
            this.spawnFood(); // Try to spawn a replacement immediately
        }

        // Updates are handled by groups (runChildUpdate: true) and Mound update methods if needed.
        // We might add checks here later if necessary.

         // Prune dead ants from mound arrays (though destroyAnt should handle this)
         // This is a safety check
         if (this.playerMound) this.playerMound.ants = this.playerMound.ants.filter(ant => ant.active);
         if (this.aiMound) this.aiMound.ants = this.aiMound.ants.filter(ant => ant.active);

          // Update UI (buttons might need updating if limits change based on live ants, not just purchased)
          // For now, updatePowerupButtons is called on resource change or purchase attempt.
          // If limits depend on *active* ants, call it here:
          // this.updatePowerupButtons();
    }
}