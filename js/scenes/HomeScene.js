// js/scenes/HomeScene.js

class HomeScene extends Phaser.Scene {
    constructor() {
        super('HomeScene');
        this.instructionsPanel = null; // To hold the panel group/container
        this.musicVolumeText = null;
        this.sfxVolumeText = null;
        this.background = null;
    }

    // No preload needed if assets are loaded in PreloadScene,
    // but you could load specific HomeScene assets here if necessary.
    // preload() {}

    create() {
        console.log("HomeScene create");
        
        this.background = this.add.tileSprite(
            0,             
            0,              // Start y coordinate
            GAME_WIDTH,     // Width of the game screen
            GAME_HEIGHT,    // Height of the game screen
            ASSETS.HOME_SCREEN_BG // The key of the texture to tile
        );
        this.background.setOrigin(0, 0);
        this.background.setDepth(-10); // A low number ensures it's in the back
        this.background.setTint(0x777777); // Darker tint on click down
        this.background.setTileScale(0.6);


        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // --- Set Default Volumes in Registry (if not already set) ---
        // The registry persists across scenes.
        if (this.registry.get('musicVolume') === undefined) {
            this.registry.set('musicVolume', 0); // Default 0%
        }
        if (this.registry.get('sfxVolume') === undefined) {
            this.registry.set('sfxVolume', 0); // Default 50%
        }

        // --- Game Title ---
        /*
        this.add.text(centerX, centerY - 250, 'Ant War', {
            fontSize: '48px',
            fill: '#ffff00', // Yellow
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        */

        this.startBackgroundMusic();

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

    startBackgroundMusic() {
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
            console.log("HomeScene: Music already playing.");
            return; // Don't start if already running
        }

        try {
            const musicVolume = this.registry.get('musicVolume') / 100;
            console.log(`HomeScene: Attempting music start. Volume: ${musicVolume}`);

            if (musicVolume <= 0) {
                console.log("HomeScene: Music volume is 0, not starting.");
                // Ensure any previous instance is stopped if volume was turned down
                if (this.backgroundMusic) this.backgroundMusic.stop();
                return;
            }

            // Add the sound instance if it doesn't exist or isn't valid
            if (!this.backgroundMusic || !this.backgroundMusic.key) {
                 this.backgroundMusic = this.sound.add(ASSETS.SOUND_MUSIC_BACKGROUND, {
                     loop: true,
                     volume: musicVolume
                 });
                 console.log("HomeScene: Created new music instance.");

                  // --- DEBUG: Listen for playback events (crucial for HomeScene start) ---
                 this.backgroundMusic.once('play', () => { console.log("HomeScene DEBUG: Music 'play' event fired!"); });
                 this.backgroundMusic.once('locked', () => {
                     console.error("HomeScene DEBUG: Music 'locked' event fired! Audio context needs interaction.");
                     // Prompt user or wait for interaction
                     this.input.once('pointerdown', () => {
                         console.log("HomeScene DEBUG: Pointer down after lock, attempting resume...");
                         if (this.sound.context.state === 'suspended') {
                            this.sound.resumeAll();
                         }
                         // Important: Check volume AGAIN before playing after interaction
                         const currentVol = this.registry.get('musicVolume') / 100;
                         if(!this.backgroundMusic.isPlaying && currentVol > 0) {
                              this.backgroundMusic.play();
                         }
                     }, this);
                 });
                 this.backgroundMusic.once('decodeerror', (s, e) => { console.error("HomeScene DEBUG: Music 'decodeerror'!", e); });
                 // --- END DEBUG ---

            } else {
                 // Instance exists, just set volume
                 this.backgroundMusic.setVolume(musicVolume);
                 console.log("HomeScene: Using existing music instance.");
            }


            // Attempt to play
            console.log("HomeScene: Calling backgroundMusic.play()...");
             if (this.sound.context.state === 'suspended') {
                 console.warn("HomeScene: Audio context suspended, play might be delayed until interaction.");
                 // Relying on the 'locked' listener and pointerdown handler
             }
             // Only call play if it's not already playing (prevents issues if function is called again)
             if (!this.backgroundMusic.isPlaying) {
                 this.backgroundMusic.play();
             } else {
                 console.log("HomeScene: Music was already playing (perhaps resumed).");
             }


        } catch (error) {
            console.error("HomeScene Error starting background music:", error);
        }
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

    let currentVolumePercent = this.registry.get(registryKey);
    let newVolumePercent = Phaser.Math.Clamp(currentVolumePercent + delta, 0, 100);
    this.registry.set(registryKey, newVolumePercent);

    // Make sure textObject exists before trying to update it
    if (textObject) {
        textObject.setText(`${newVolumePercent}%`);
    } else {
        console.warn(`AdjustVolume: Text object for '${type}' not found.`);
    }

    console.log(`${type.toUpperCase()} Volume set to: ${newVolumePercent}%`);

    if (type === 'sfx') {
        const sfxVolume = newVolumePercent / 100; // Convert to 0.0-1.0
        const sfxKey = ASSETS.SOUND_SFX_GAME_START; // Key for the preview sound

        console.log(`AdjustVolume DEBUG: Handling SFX. New volume: ${sfxVolume}`);

        // Only play the sample sound if volume is audible
        if (sfxVolume > 0) {
            console.log(`AdjustVolume DEBUG: Attempting to play sample SFX '${sfxKey}'...`);

            // Check audio context state
            if (this.sound.context.state === 'running') {
                try {
                    // Check if the key exists in the cache before playing
                    // Using the correct cache check: this.sound.cache.audio.has(key)
                    if (this.cache.audio.has(sfxKey)) {
                        // Play the sound effect using the new volume
                        this.sound.play(sfxKey, { volume: sfxVolume });
                        console.log(`AdjustVolume DEBUG: Played sample SFX '${sfxKey}' with volume ${sfxVolume}.`);
                    } else {
                         console.error(`AdjustVolume ERROR: SFX key '${sfxKey}' not found in cache! Check loading.`);
                    }
                } catch (error) {
                    console.error(`AdjustVolume ERROR: Error playing sample SFX '${sfxKey}':`, error);
                }
            } else {
                console.warn(`AdjustVolume DEBUG: SFX Context not running ('${this.sound.context.state}'). Sample SFX playback deferred/skipped.`);
                // Since the user *is* interacting (clicking volume), we could try resuming,
                // but play() usually handles this if context is just suspended.
                // If it consistently fails here, resuming might be needed:
                // if (this.sound.context.state === 'suspended') { this.sound.resumeAll(); }
            }
        } else {
            console.log("AdjustVolume DEBUG: SFX Volume is 0, sample not played.");
        }
    }

    // --- Handle MUSIC Volume Change ---
    if (type === 'music') {
        const newVolume = newVolumePercent / 100;
        console.log(`AdjustVolume DEBUG: Handling music. New volume: ${newVolume}. Current instance:`, this.backgroundMusic); // Add log

        // Case 1: Music instance DOES NOT exist (e.g., started at 0 volume)
        if (!this.backgroundMusic || !this.backgroundMusic.key) { // More robust check
            console.log("AdjustVolume DEBUG: No valid music instance exists.");
            if (newVolume > 0) {
                console.log("AdjustVolume DEBUG: Volume > 0, attempting to start music via startBackgroundMusic().");
                // Try starting it now that volume is > 0
                this.startBackgroundMusic(); // <<< CALL START FUNCTION
            } else {
                console.log("AdjustVolume DEBUG: Volume is 0, doing nothing (no instance).");
            }
        }
        // Case 2: Music instance DOES exist
        else {
            console.log("AdjustVolume DEBUG: Music instance exists. Setting volume.");
            this.backgroundMusic.setVolume(newVolume);

            // Subcase 2a: Volume now > 0, but music wasn't playing (maybe paused/stopped/locked)
            if (newVolume > 0 && !this.backgroundMusic.isPlaying) {
                console.log("AdjustVolume DEBUG: Instance exists, volume > 0, not playing. Attempting play...");
                if (this.sound.context.state === 'running') {
                     console.log("AdjustVolume DEBUG: Context running, calling play().");
                    this.backgroundMusic.play(); // Call play, it handles resuming if paused
                } else {
                    console.warn(`AdjustVolume DEBUG: Context not running ('${this.sound.context.state}'), cannot play yet. Need interaction.`);
                    // Set up listener AGAIN just in case context got suspended
                     this.input.once('pointerdown', () => {
                          if (this.sound.context.state === 'suspended') this.sound.resumeAll();
                          const currentVol = this.registry.get('musicVolume') / 100;
                          if (this.backgroundMusic && !this.backgroundMusic.isPlaying && currentVol > 0) {
                               this.backgroundMusic.play();
                          }
                     }, this);
                }
            }
            // Subcase 2b: Volume turned down to 0, stop the music
            else if (newVolume === 0 && this.backgroundMusic.isPlaying) {
                console.log("AdjustVolume DEBUG: Volume is 0, stopping playing instance.");
                this.backgroundMusic.stop();
            } else {
                 console.log("AdjustVolume DEBUG: Instance exists, volume set. No further play/stop action needed right now.");
            }
        }
    }
} // End adjustVolume

    showInstructions() {
        // Prevent creating multiple panels
        if (this.instructionsPanel) {
            return;
        }

        const panelWidth = this.cameras.main.width * 0.8;
        const panelHeight = this.cameras.main.height * 0.9;
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

        const textObject = this.add.text(panelX, panelY - panelHeight/2 + 25, instructionsText, {
            fontSize: '16px',
            fill: '#fff',
            wordWrap: { width: panelWidth - 40 }, // Allow wrapping within panel
            align: 'left',
            lineSpacing: 5
        }).setOrigin(0.5, 0).setDepth(101);

        // Close Button
        const closeButton = this.add.text(panelX + panelWidth / 2 - 30, panelY - panelHeight / 2, 'X', {
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

    shutdown() {
        console.log("HomeScene shutdown.");
        if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
             console.log("Stopping music due to HomeScene shutdown.");
             this.backgroundMusic.stop();
             // Set to null if GameScene shouldn't reuse the instance
             // this.backgroundMusic = null;
        }
         // Clean up instructions panel if open
        this.hideInstructions();
     }
}