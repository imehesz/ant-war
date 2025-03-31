// js/entities/Mound.js
class Mound extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, isPlayer, enemyMoundRef) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Make mound static

        this.health = MOUND_START_HEALTH;
        this.resources = MOUND_START_RESOURCES;
        this.isPlayer = isPlayer;
        this.enemyMound = enemyMoundRef; // Reference to the opponent
        this.ants = []; // Keep track of owned ants

         // Ant counts
         this.antCounts = {
             FighterAnt: 0,
             GathererAnt: 0,
             MegaFighterAnt: 0,
             purchasedFighters: 0, // Track purchased ones specifically for limit
             purchasedGatherers: 0 // Track purchased ones specifically for limit
         };

        this.setImmovable(true);

        // Health text (display only for player for now)
        if (this.isPlayer) {
            this.healthText = scene.add.text(40, y + 30, `H: ${this.health}`, { fontSize: '16px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
            this.resourceText = scene.add.text(30, y + 50, `R: ${this.resources}`, { fontSize: '16px', fill: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
        } else {
             // Maybe add AI health display later for debugging/clarity if needed
             this.healthText = scene.add.text(x, y - 40, `Health: ${this.health}`, { fontSize: '16px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
             this.resourceText = null; // AI resources not shown
        }
    }

    setEnemyMound(enemy) {
        this.enemyMound = enemy;
    }

    // js/entities/Mound.js -> spawnAnt method
    spawnAnt(AntClass, purchase = false) { // Accept the purchase flag
    if (!this.enemyMound) {
        console.error("Cannot spawn ant, enemy mound not set!");
        return null;
    }
    // Check purchase limits
    if (purchase) {
        if (AntClass === GathererAnt && this.antCounts.purchasedGatherers >= MAX_ANTS.GATHERER) {
            console.log(`${this.isPlayer ? 'Player' : 'AI'} Max purchased Gatherers reached`);
            return null;
        }
        if (AntClass === FighterAnt && this.antCounts.purchasedFighters >= MAX_ANTS.FIGHTER) {
             console.log(`${this.isPlayer ? 'Player' : 'AI'} Max purchased Fighters reached`);
            return null;
        }
    }

    const spawnOffset = this.isPlayer ? -40 : 40;
    const ant = new AntClass(this.scene, this.x, this.y + spawnOffset, this, this.enemyMound);

    if (ant) {
         ant.wasPurchased = purchase; // *** SET THE FLAG HERE ***
         this.ants.push(ant);
         if (purchase) {
             if (AntClass === GathererAnt) this.antCounts.purchasedGatherers++;
             if (AntClass === FighterAnt) this.antCounts.purchasedFighters++;
             console.log(`Incremented purchased ${AntClass.name} count for ${this.isPlayer ? 'Player' : 'AI'}. New count: ${purchase ? (AntClass === GathererAnt ? this.antCounts.purchasedGatherers : this.antCounts.purchasedFighters) : 'N/A'}`);
         }
          // Update player UI immediately after purchase
          if (this.isPlayer && purchase) {
              this.scene.updatePowerupButtons();
          }
         return ant;
    }
    return null;
    }

     incrementAntCount(antClassName) {
         if (this.antCounts.hasOwnProperty(antClassName)) {
             this.antCounts[antClassName]++;
              console.log(`${this.isPlayer ? 'Player' : 'AI'} ${antClassName} count: ${this.antCounts[antClassName]}`);
         }
     }

     decrementAntCount(antClassName) {
          if (this.antCounts.hasOwnProperty(antClassName)) {
             this.antCounts[antClassName]--;
             // Note: We don't decrement 'purchased' counts here, only total counts.
             // 'purchased' counts track how many have been *bought*, not how many are currently alive.
             console.log(`${this.isPlayer ? 'Player' : 'AI'} ${antClassName} count: ${this.antCounts[antClassName]}`);
         }
     }


    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
         console.log(`${this.isPlayer ? 'Player' : 'AI'} Mound health: ${this.health}`);

        if (this.healthText) {
            this.healthText.setText(`Health: ${this.health}`);
            // Add visual feedback (flash red?)
            this.scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
            });
        }

        if (this.health <= 0) {
            this.scene.gameOver(this.isPlayer ? 'AI Wins!' : 'Player Wins!');
        }
    }

    addResources(amount) {
        this.resources += amount;
         console.log(`${this.isPlayer ? 'Player' : 'AI'} Mound resources: ${this.resources}`);
        if (this.resourceText) {
            this.resourceText.setText(`R: ${this.resources}`);
        }
         // Update powerup button states if this is the player mound
         if (this.isPlayer) {
             this.scene.updatePowerupButtons();
         }
    }

     spendResources(amount) {
         if (this.resources >= amount) {
             this.resources -= amount;
              if (this.resourceText) {
                 this.resourceText.setText(`R: ${this.resources}`);
             }
             // Update powerup button states if this is the player mound
             if (this.isPlayer) {
                  this.scene.updatePowerupButtons();
             }
             return true; // Purchase successful
         }
         return false; // Not enough resources
     }


    update(time, delta) {
        // Mound specific updates if any (e.g., passive resource generation?)
    }
}