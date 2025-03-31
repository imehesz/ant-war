// js/entities/PowerupButton.js
class PowerupButton extends Phaser.GameObjects.Container {
    constructor(scene, x, y, text, cost, textureKey, callback) {
        super(scene, x, y);
        this.scene = scene;
        this.buttonText = text;
        this.cost = cost;
        this.callback = callback;
        this.isEnabled = false;

        // Background sprite
        this.background = scene.add.sprite(0, 0, textureKey).setInteractive({ useHandCursor: true });
        this.background.setOrigin(0.5);
        this.background.setTint(0x888888); // Start grayed out

        // Text label
        this.label = scene.add.text(0, 0, `${text}\n(${cost})`, {
            fontSize: '12px',
            fill: '#000',
            align: 'center',
            wordWrap: { width: this.background.width - 10 }
        }).setOrigin(0.5);

        this.add([this.background, this.label]); // Add elements to the container
        scene.add.existing(this); // Add the container itself to the scene

        // Event listener
        this.background.on('pointerdown', () => {
            if (this.isEnabled) {
                this.callback();
            }
        });
         // Optional: Add hover effect
         this.background.on('pointerover', () => {
             if (this.isEnabled) this.background.setTint(0xcccccc);
         });
          this.background.on('pointerout', () => {
             if (this.isEnabled) this.background.setTint(0xffffff); // Back to normal enabled color
              else this.background.setTint(0x888888); // Ensure stays grayed out if disabled
         });
    }

    updateEnabled(currentResources, purchaseLimits) {
        // Check both cost and any purchase limits
        let limitReached = false;
        if (this.buttonText === 'Gatherer' && purchaseLimits.purchasedGatherers >= MAX_ANTS.GATHERER) {
            limitReached = true;
        }
        if (this.buttonText === 'Fighter' && purchaseLimits.purchasedFighters >= MAX_ANTS.FIGHTER) {
            limitReached = true;
        }

        if (currentResources >= this.cost && !limitReached) {
            this.isEnabled = true;
            this.background.clearTint(); // Enable visual state (white/normal)
             this.label.setAlpha(1);
        } else {
            this.isEnabled = false;
            this.background.setTint(0x888888); // Disable visual state (grayed out)
             this.label.setAlpha(0.6);
        }
    }
}