// js/entities/Mound.js
class Mound extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, isPlayer, enemyMoundRef, customHealth) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this, true); // Make mound static

        this.health = customHealth || MOUND_START_HEALTH;
        this.resources = MOUND_START_RESOURCES;
        this.isPlayer = isPlayer;
        this.enemyMound = enemyMoundRef;
        this.ants = [];

         this.antCounts = {
             FighterAnt: 0,
             GathererAnt: 0,
             MegaFighterAnt: 0,
             purchasedFighters: 0,
             purchasedGatherers: 0
         };

        this.setImmovable(true);

        // Health text
        if (this.isPlayer) {
            // Player health: bottom display near mound
            this.bottomHealthText = scene.add.text(x, y + 40, `Health: ${this.health}`, {
                fontSize: '16px', fill: '#fff', fontStyle: 'bold',
                backgroundColor: '#000000aa', padding: { left: 6, right: 6, top: 2, bottom: 2 }
            }).setOrigin(0.5);
            this.bottomHealthText.setDepth(10);
        } else {
            // Enemy health: above mound with dark background
            this.healthText = scene.add.text(x, y - 40, `Health: ${this.health}`, {
                fontSize: '16px', fill: '#fff', fontStyle: 'bold',
                backgroundColor: '#000000aa', padding: { left: 6, right: 6, top: 2, bottom: 2 }
            }).setOrigin(0.5);
            this.resourceText = null;
        }
    }

    setEnemyMound(enemy) {
        this.enemyMound = enemy;
    }

    spawnAnt(AntClass, purchase = false) {
    if (!this.enemyMound) {
        console.error("Cannot spawn ant, enemy mound not set!");
        return null;
    }
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
         ant.wasPurchased = purchase;
         this.ants.push(ant);
         if (purchase) {
             if (AntClass === GathererAnt) this.antCounts.purchasedGatherers++;
             if (AntClass === FighterAnt) this.antCounts.purchasedFighters++;
         }
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
         }
     }

     decrementAntCount(antClassName) {
          if (this.antCounts.hasOwnProperty(antClassName)) {
             this.antCounts[antClassName]--;
         }
     }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
         console.log(`${this.isPlayer ? 'Player' : 'AI'} Mound health: ${this.health}`);

        if (this.healthText) {
            if( this.isPlayer) {
                this.healthText.setText(stringUtils.leftFill(this.health,3,'0'))
            } else {
                this.healthText.setText(`Health: ${this.health}`)
            }
            this.scene.tweens.add({
                targets: this,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
            });
        }

        // Update bottom health text for player mound
        if (this.bottomHealthText) {
            this.bottomHealthText.setText(`Health: ${this.health}`);
        }

        if (this.health <= 0) {
            this.scene.gameOver(this.isPlayer ? 'AI Wins!' : 'Player Wins!');
        }
    }

    addResources(amount) {
        this.resources += amount;
         console.log(`${this.isPlayer ? 'Player' : 'AI'} Mound resources: ${this.resources}`);
        if (this.resourceText) {
            this.resourceText.setText(stringUtils.leftFill(this.resources,4,'0'));
        }
         if (this.isPlayer) {
             this.scene.updatePowerupButtons();
         }
    }

     spendResources(amount) {
         if (this.resources >= amount) {
             this.resources -= amount;
              if (this.resourceText) {
                 this.resourceText.setText(stringUtils.leftFill(this.resources, 4, '0'));
             }
             if (this.isPlayer) {
                  this.scene.updatePowerupButtons();
             }
             return true;
         }
         return false;
     }

    update(time, delta) {
        // Mound specific updates if any
    }
}
