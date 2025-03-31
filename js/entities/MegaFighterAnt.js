// js/entities/MegaFighterAnt.js
class MegaFighterAnt extends Ant {
     constructor(scene, x, y, ownerMound, enemyMound) {
        super(scene, x, y, ASSETS.MEGA_FIGHTER_ANT, ownerMound, enemyMound);
        this.speed = MEGA_FIGHTER_SPEED;
        this.damage = MEGA_FIGHTER_DAMAGE;
        this.isMega = true; // Important flag
         this.ownerMound.incrementAntCount(this.constructor.name);
    }

    // Mega fighter specific logic if needed
}