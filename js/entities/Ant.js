// js/entities/Ant.js
class Ant extends Phaser.Physics.Arcade.Sprite {
    // js/entities/Ant.js -> constructor
    constructor(scene, x, y, texture, ownerMound, target) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.ownerMound = ownerMound;
        this.target = target;
        this.speed = ANT_SPEED;
        this.isMega = false;
        this.wasPurchased = false; // *** Add default value ***

        this.setCollideWorldBounds(true);
        this.body.onWorldBounds = true;

        // center point of the ant sprite for better movement calculations
        this.setOrigin(0.5, 0.5);
    }

    update(time, delta) {
        this.updateMovement(delta);
        this.updateRotation();
    }

    updateMovement(delta) {
        if (this.target && this.active) {
             // If target is a valid game object with x/y
            if (this.target.active && typeof this.target.x === 'number' && typeof this.target.y === 'number') {
                this.scene.physics.moveToObject(this, this.target, this.speed);

                // Optional: Stop moving if very close to avoid jittering
                let distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
                if (distance < 5) { // Adjust threshold as needed
                    this.body.setVelocity(0, 0);
                }
            } else {
                // Target became inactive or invalid, stop moving
                this.body.setVelocity(0, 0);
                this.target = null; // Clear target
                 console.warn("Ant lost its target:", this);
                 this.setIdle(); // Implement this if needed
            }
        } else {
             this.body.setVelocity(0, 0); // Stop if no target
        }
    }

    updateRotation() {
        // Check if we have a physics body and a valid target
        if (this.body && this.target && this.target.active && typeof this.target.x === 'number') {
            // Only rotate if actually moving or very close to starting/ending move
            const velocity = this.body.velocity;
            const isMoving = velocity.x !== 0 || velocity.y !== 0;
            let distanceToTarget = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);


             // Rotate if moving OR if stopped but still have a target (to face it when idle)
             // Avoid rotating if distance is large but velocity is zero (e.g. blocked?)
             if (isMoving || (distanceToTarget > 1 && distanceToTarget < 1000)) { // Added distance check to avoid rotating if stuck far away

                // Calculate the angle from the ant to its target in radians
                let angleRadians = Phaser.Math.Angle.Between(
                    this.x,
                    this.y,
                    this.target.x,
                    this.target.y
                );

                // Adjust the angle based on the sprite's default orientation.
                // Phaser angles have 0 radians pointing right.
                // If your ant sprite faces UPWARDS by default, add PI/2 radians (90 degrees).
                // If your ant sprite faces RIGHT by default, no adjustment is needed.
                // If your ant sprite faces DOWNWARDS by default, add -PI/2 radians (-90 degrees).
                // If your ant sprite faces LEFT by default, add PI radians (180 degrees).
                // Assuming your ant sprite's head points UP:
                this.rotation = angleRadians + Math.PI / 2;

                // --- Use this line instead if your ant sprite faces RIGHT by default ---
                // this.rotation = angleRadians;
             }

        }
        // Optional: What happens if there's no target? Reset rotation?
        // else {
        //     this.rotation = 0; // Or face default direction, e.g., Math.PI / 2 for up
        // }
    }

    setTarget(target) {
        this.target = target;
    }

    // Placeholder for idle behavior if needed
    setIdle() {
        // e.g., wander slightly or just stop
        this.body.setVelocity(0, 0);
    }

    // Override in subclasses if specific destruction logic is needed
    // js/entities/Ant.js
    destroyAnt() {
    if (this.ownerMound && this.ownerMound.active) { // Check if owner mound exists
        const index = this.ownerMound.ants.indexOf(this);
        if (index > -1) {
            this.ownerMound.ants.splice(index, 1);
        }

        // Decrement total ant count
        this.ownerMound.decrementAntCount(this.constructor.name);

        // *** NEW: Decrement PURCHASED count if applicable ***
         // We need a way to know if *this specific ant* was purchased.
         // Let's add a flag when spawning purchased ants.

         if (this.wasPurchased) {
             if (this instanceof GathererAnt && this.ownerMound.antCounts.purchasedGatherers > 0) {
                 this.ownerMound.antCounts.purchasedGatherers--;
                  console.log(`Decremented purchased GATHERER count for ${this.ownerMound.isPlayer ? 'Player' : 'AI'}. New count: ${this.ownerMound.antCounts.purchasedGatherers}`);
             } else if (this instanceof FighterAnt && this.ownerMound.antCounts.purchasedFighters > 0) {
                 this.ownerMound.antCounts.purchasedFighters--;
                 console.log(`Decremented purchased FIGHTER count for ${this.ownerMound.isPlayer ? 'Player' : 'AI'}. New count: ${this.ownerMound.antCounts.purchasedFighters}`);
             }
             // Mega Fighters don't have a purchase limit in this design
         }
         // *** End of New Block ***

        // Update player UI if the owner was the player mound after counts changed
        if (this.ownerMound.isPlayer) {
            this.ownerMound.scene.updatePowerupButtons();
        }
    }
    this.destroy(); // Phaser's destroy method
    }
}