// js/entities/FighterAnt.js
class FighterAnt extends Ant {
    constructor(scene, x, y, ownerMound, enemyMound) {
        super(scene, x, y, ASSETS.FIGHTER_ANT, ownerMound, enemyMound);
        this.speed = ANT_SPEED;
        this.damage = FIGHTER_DAMAGE;
        this.isMega = false;
         this.ownerMound.incrementAntCount(this.constructor.name);
    }

    // Fighter specific logic can go here if needed beyond base movement
    // For now, it just targets the enemy mound directly.
}