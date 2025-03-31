// js/entities/Food.js
class Food extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, ASSETS.FOOD);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.body.setImmovable(true); // Ants shouldn't push food around
        this.body.allowGravity = false;
    }

     // Custom destruction method to potentially add effects later
     destroyFood() {
         if (this.scene) { // Check if scene still exists
             // Optional: Add particle effect or sound here
             this.destroy(); // Phaser's destroy method
         }
     }
}