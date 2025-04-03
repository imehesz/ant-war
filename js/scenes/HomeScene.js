// js/scenes/HomeScene.js

class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
        this.instructionsPanel = null; // To hold the panel group/container
        this.musicVolumeText = null;
        this.sfxVolumeText = null;
    }

    // No preload needed if assets are loaded in PreloadScene,
    // but you could load specific HomeScene assets here if necessary.
    // preload() {}

    create() {
        console.log("HomeScene create");
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // --- Set Default Volumes in Registry (if not already set) ---
        // The registry persists across scenes.
        if (this.registry.get('musicVolume') === undefined) {
            this.registry.set('musicVolume', 0); // Default 0%
        }
        if (this.registry.get('sfxVolume') === undefined) {
            this.registry.set('sfxVolume', 50); // Default 50%
        }

        // --- Game Title ---
        this.add.text(centerX, centerY - 250, 'Ant War', {
            fontSize: '48px',
            fill: '#ffff00', // Yellow
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // --- Buttons ---
        const buttonYStart = centerY - 100;
        const buttonSpacing = 70;

        // Start Game Button
        const startButton = this.add.text(centerX, buttonYStart, 'Start Game', {
            fontSize: '32px',
            fill: '#0f0', // Green
            backgroundColor: '#555',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => {
             console.log("Starting GameScene...");
             // Optional: Add a small fade out/in transition?
             this.scene.start('GameScene');
        });
        this.addHoverEffect(startButton);

        // How to Play Button
        const instructionsButton = this.add.text(centerX, buttonYStart + buttonSpacing, 'How to Play', {
            fontSize: '32px',
            fill: '#fff',
            backgroundColor: '#555',
            padding: { left: 15, right: 15, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        instructionsButton.on('pointerdown', () => {
            this.showInstructions();
        });
         this.addHoverEffect(instructionsButton);


        // --- Volume Controls ---
        const volumeYStart = buttonYStart + buttonSpacing * 2.5; // Position below buttons
        const volumeLabelX = centerX - 150;
        const volumeValueX = centerX + 80;
        const volumeButtonXOffset = 90;
        const volumeButtonSpacing = 40;

        // Music Volume
        this.add.text(volumeLabelX, volumeYStart, 'Music Volume:', { fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);
        this.musicVolumeText = this.add.text(volumeValueX, volumeYStart, `${this.registry.get('musicVolume')}%`, { fontSize: '20px', fill: '#ff0', fontStyle: 'bold' }).setOrigin(0.5);
        const musicDown = this.add.text(volumeValueX + volumeButtonXOffset, volumeYStart, '-', { fontSize: '30px', fill: '#f00', backgroundColor: '#666', padding: { x: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const musicUp = this.add.text(volumeValueX + volumeButtonXOffset + volumeButtonSpacing, volumeYStart, '+', { fontSize: '30px', fill: '#0f0', backgroundColor: '#666', padding: { x: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        musicDown.on('pointerdown', () => this.adjustVolume('music', -10));
        musicUp.on('pointerdown', () => this.adjustVolume('music', 10));
        this.addHoverEffect(musicDown, '#900');
        this.addHoverEffect(musicUp, '#090');


        // SFX Volume
        const sfxY = volumeYStart + 40;
        this.add.text(volumeLabelX, sfxY, 'Sound FX Volume:', { fontSize: '20px', fill: '#fff' }).setOrigin(0, 0.5);
        this.sfxVolumeText = this.add.text(volumeValueX, sfxY, `${this.registry.get('sfxVolume')}%`, { fontSize: '20px', fill: '#ff0', fontStyle: 'bold' }).setOrigin(0.5);
        const sfxDown = this.add.text(volumeValueX + volumeButtonXOffset, sfxY, '-', { fontSize: '30px', fill: '#f00', backgroundColor: '#666', padding: { x: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const sfxUp = this.add.text(volumeValueX + volumeButtonXOffset + volumeButtonSpacing, sfxY, '+', { fontSize: '30px', fill: '#0f0', backgroundColor: '#666', padding: { x: 5 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        sfxDown.on('pointerdown', () => this.adjustVolume('sfx', -10));
        sfxUp.on('pointerdown', () => this.adjustVolume('sfx', 10));
        this.addHoverEffect(sfxDown, '#900');
        this.addHoverEffect(sfxUp, '#090');

    }

    addHoverEffect(button, hoverTint = 0xcccccc) {
        button.on('pointerover', () => {
            button.setTint(hoverTint); // Apply tint on hover
        });
        button.on('pointerout', () => {
            button.clearTint(); // Remove tint
        });
         button.on('pointerdown', () => {
             button.setTint(0xaaaaaa); // Darker tint on click down
         });
          button.on('pointerup', () => { // Also handle pointerup to reset tint
             button.clearTint();
          });
    }

    adjustVolume(type, delta) {
        const registryKey = type === 'music' ? 'musicVolume' : 'sfxVolume';
        const textObject = type === 'music' ? this.musicVolumeText : this.sfxVolumeText;

        let currentVolume = this.registry.get(registryKey);
        let newVolume = Phaser.Math.Clamp(currentVolume + delta, 0, 100); // Clamp between 0 and 100

        this.registry.set(registryKey, newVolume);
        textObject.setText(`${newVolume}%`);

        console.log(`${type.toUpperCase()} Volume set to: ${newVolume}%`);
        // In a real implementation, you would also update the actual sound manager's volume here
        // e.g., this.sound.setVolume(newVolume / 100); for global volume, or for specific sounds/music.
    }

    showInstructions() {
        // Prevent creating multiple panels
        if (this.instructionsPanel) {
            return;
        }

        const panelWidth = this.cameras.main.width * 0.8;
        const panelHeight = this.cameras.main.height * 0.7;
        const panelX = this.cameras.main.width / 2;
        const panelY = this.cameras.main.height / 2;

        // Semi-transparent background
        const graphics = this.add.graphics()
            .fillStyle(0x000000, 0.85) // Black, 85% opaque
            .fillRect(panelX - panelWidth / 2, panelY - panelHeight / 2, panelWidth, panelHeight)
            .setDepth(100); // Ensure it's above other UI

        // Instruction Text (adjust content as needed)
        const instructionsText = `How to Play Ant War:\n
- Goal: Destroy the enemy Ant Mound at the top.\n
- Mounds start with ${MOUND_START_HEALTH} health.
- Your mound automatically spawns Fighter Ants every ${FIGHTER_SPAWN_INTERVAL / 1000} seconds.\n
- Fighter Ants attack enemy ants and the enemy mound (-${FIGHTER_DAMAGE} HP).\n
- Gatherer Ants collect food (green dots) and return it for +${FOOD_RESOURCE_VALUE} resources.\n
- Use resources to buy Powerups (buttons on the right):\n
  - Gatherer: Cost ${POWERUP_COSTS.GATHERER}. Max ${MAX_ANTS.GATHERER} purchasable. Gets more resources. Indestructible in combat.
  - Fighter: Cost ${POWERUP_COSTS.FIGHTER}. Max ${MAX_ANTS.FIGHTER} purchasable. Adds attackers.
  - Mega Fighter: Cost ${POWERUP_COSTS.MEGA_FIGHTER}. Powerful ant (-${MEGA_FIGHTER_DAMAGE} HP), only weak vs other Mega Fighters.
  - Sand Bomb: Cost ${POWERUP_COSTS.SAND_BOMB}. Instantly damages enemy mound (-${SAND_BOMB_DAMAGE} HP). Sends a visual tornado.\n
- Protect your mound and manage your resources!`;

        const textObject = this.add.text(panelX, panelY - panelHeight/2 - 20, instructionsText, {
            fontSize: '16px',
            fill: '#fff',
            wordWrap: { width: panelWidth - 40 }, // Allow wrapping within panel
            align: 'left',
            lineSpacing: 5
        }).setOrigin(0.5, 0).setDepth(101);

        // Close Button
        const closeButton = this.add.text(panelX + panelWidth / 2 - 30, panelY - panelHeight / 2 - 50, 'X', {
            fontSize: '24px',
            fill: '#f00',
            backgroundColor: '#333',
            padding: {x: 8, y: 4}
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(101);

        closeButton.on('pointerdown', () => {
            this.hideInstructions();
        });
         this.addHoverEffect(closeButton);

        // Store references to destroy them later
        this.instructionsPanel = { graphics, textObject, closeButton };
    }

    hideInstructions() {
        if (this.instructionsPanel) {
            this.instructionsPanel.graphics.destroy();
            this.instructionsPanel.textObject.destroy();
            this.instructionsPanel.closeButton.destroy();
            this.instructionsPanel = null;
        }
    }
}