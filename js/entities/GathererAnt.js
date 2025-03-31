// js/entities/GathererAnt.js
class GathererAnt extends Ant {
    constructor(scene, x, y, ownerMound) {
        super(scene, x, y, ASSETS.GATHERER_ANT, ownerMound, null); // Starts with no target
        this.speed = GATHERER_SPEED;
        this.carryingFood = false;
        this.targetFood = null;
        this.findClosestFood(); // Initial search
         this.ownerMound.incrementAntCount(this.constructor.name);
    }

    update(time, delta) {
        // If not carrying food and no target food, find one
        if (!this.carryingFood && (!this.target || !this.target.active) && this.active) {
             this.findClosestFood();
        }

         // Check if reached target
        if (this.target && this.active) {
            let distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);

            if (distance < 10) { // Close enough to target
                if (this.carryingFood && this.target === this.ownerMound) {
                    // Reached mound with food
                    this.dropOffFood();
                } else if (!this.carryingFood && this.target === this.targetFood) {
                     // Reached food source
                     this.collectFood(this.targetFood);
                }
            }
        }


        super.update(time, delta); // Call base movement logic
    }

    findClosestFood() {
        if (!this.scene || !this.scene.foodSources) {
             console.warn("Food sources group not ready for gatherer:", this);
            return;
        }

        let closestFood = this.scene.physics.closest(this, this.scene.foodSources.getChildren().filter(f => f.active));

        if (closestFood) {
            this.targetFood = closestFood;
            this.setTarget(closestFood);
            // console.log("Gatherer found food:", closestFood.x, closestFood.y);
        } else {
            // No food available, maybe wait or wander?
            this.targetFood = null;
            this.setTarget(null); // Stop moving or set idle target
            // console.log("Gatherer: No food found.");
        }
    }

    collectFood(food) {
        if (food && food.active && this.active && !this.carryingFood) {
            console.log(`Gatherer [${this.x.toFixed(0)},${this.y.toFixed(0)}] COLLECTING food [${food.x.toFixed(0)},${food.y.toFixed(0)}]`);
            this.carryingFood = true;
            this.targetFood = null; // Stop targeting the food item specifically

            console.log(`Gatherer [${this.x.toFixed(0)},${this.y.toFixed(0)}] Preparing to set target to OWNER MOUND.`);
            if (this.ownerMound && this.ownerMound.active) {
                 this.setTarget(this.ownerMound); // Target the home mound
                 console.log(`Gatherer [${this.x.toFixed(0)},${this.y.toFixed(0)}] Target successfully set to OWNER MOUND [${this.ownerMound.x.toFixed(0)},${this.ownerMound.y.toFixed(0)}]`);
                 this.setTexture(ASSETS.GATHERER_ANT_CARRYING);
            } else {
                 console.error("Gatherer cannot target owner mound - it's missing or inactive! Ant may idle.");
                 // Don't destroy, maybe just idle
                 this.setTarget(null);
                 this.carryingFood = false; // Drop the food effectively
                 return;
            }

            // We can keep the tint for visual cue if you like
            // Remove this if you still suspect it causes rendering issues
            // this.setTint(0x00ff00);

            food.destroyFood();
        } else {
            // console.log("Tried to collect invalid/already collected food or already carrying.");
            if (!this.carryingFood && this.active) {
                 this.findClosestFood();
            }
        }
    }

    dropOffFood() {
        if (!this.active || !this.carryingFood) return; // Only drop off if active and carrying

        console.log(`Gatherer [${this.x.toFixed(0)},${this.y.toFixed(0)}] attempting to DROP OFF FOOD at Mound [${this.ownerMound.x.toFixed(0)},${this.ownerMound.y.toFixed(0)}]`);

        // Ensure the owner mound still exists and is active before adding resources
        if (this.ownerMound && this.ownerMound.active) {
            this.ownerMound.addResources(FOOD_RESOURCE_VALUE);
            this.carryingFood = false; // Set flag to false

            this.setTexture(ASSETS.GATHERER_ANT);

            // Clear the tint if you were using it
            this.clearTint();

            console.log(`Gatherer [${this.x.toFixed(0)},${this.y.toFixed(0)}] Dropped off food. LOOKING FOR NEW FOOD.`);

            // **** CHANGE: Instead of destroying, find more food ****
            this.findClosestFood(); // <<< Look for the next target

        } else {
            console.warn("Gatherer tried to drop off food, but owner mound is gone. Ant will idle.");
            this.carryingFood = false;
            this.clearTint();
            // If mound is gone, the ant just stops having a target
            this.setTarget(null);
        }
    }

    // Override destroy to ensure counts are correct
    destroyAnt() {
        console.log(`Gatherer Ant [${this.x.toFixed(0)}, ${this.y.toFixed(0)}] is being destroyed.`);
        super.destroyAnt(); // Call the original destruction logic (removes from mound list, decrements counts etc)
    }
}