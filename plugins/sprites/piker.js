import { Character } from './character.js';

/**
 * Piker — a patrolling enemy that damages the player on contact.
 * Extends Character for all shared physics / movement logic.
 * Adds: constant hitbox (danger zone), bounce reactions, and the
 * pikerBounce collision handler that resolves player/piker collisions.
 */
export class Piker extends Character {

    constructor({ scene, x = 0, y = 0, image = 'piker_sheet', name, speed, indexArray, indexGroup,
        simpleInstruction, constantHitbox, constantHitboxOffset, bodyOffset, bodySize,
        bounce, direction }) {

        super({ scene, x, y, image, name, speed,
            simpleInstruction: simpleInstruction || { action: 'patrol', option: '' },
            bodyOffset: bodyOffset || { x: 8, y: 0 },
            bodySize:   bodySize   || { x: 16, y: 16 },
            bounce:     bounce     || 0 });

        // ── Piker-specific config ────────────────────────────────────────
        this.type        = 'piker';
        this.name        = name || `piker_${indexArray}_${indexGroup}_${scene.scene.key}`;
        this.speed       = speed || 30;
        this.indexArray  = indexArray;
        this.indexGroup  = indexGroup;
        this.direction      = direction || 'left';
        this.hitboxCollider = null;
        this.bounceCooldown = 0;   // short anti-sandwich cooldown, independent of arc

        // ── Body collider with player (pikerBounce handles physics) ─────
        scene.physics.add.collider(
            this, window.player,
            () => this.pikerBounce(window.player, this),
            null, this
        );

        // ── Constant hitbox (the piker's danger zone) ────────────────────
        const hitboxDef = constantHitbox || { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 };
        this.constantHitboxOffset = constantHitboxOffset || { x: 0, y: 0 };

        const hitboxRect = scene.add.rectangle(
            x + hitboxDef.offsetX,
            y + hitboxDef.offsetY,
            hitboxDef.width,
            hitboxDef.height,
            hitboxDef.color,
            hitboxDef.alpha
        );
        this.constantHitbox       = hitboxRect;
        this.constantHitboxOffset = { x: hitboxDef.offsetX, y: hitboxDef.offsetY };

        hitboxRect.setVisible(false);

        scene.physics.world.enable(hitboxRect, 0);
        scene.add.existing(hitboxRect);
        scene.physics.add.existing(hitboxRect);
        hitboxRect.body.setAllowGravity(false);
        hitboxRect.setDepth(10);

        this.hitboxCollider = scene.physics.add.overlap(
            window.player, hitboxRect,
            () => this.handlePlayerHit(window.player, this),
            null, this
        );

        // ── Animations ───────────────────────────────────────────────────
        // Walk: frames 0-2 (24×16 grid, already set up on 'piker_sheet').
        if (!scene.anims.exists('piker_walk')) {
            scene.anims.create({
                key: 'piker_walk',
                frames: scene.anims.generateFrameNumbers('piker_walk', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1,
            });
        }

        // Impact: 4-frame animation from the bottom row of piker_sheet, plays ONCE.
        // After it completes, the 'animationcomplete' listener below switches to piker_hit.
        if (!scene.anims.exists('piker_impact')) {
            scene.anims.create({
                key: 'piker_impact',
                frames: scene.anims.generateFrameNumbers('piker_impact_sheet', { start: 0, end: 1 }),
                frameRate: 8,
                repeat: 0,
            });
        }

        // Stunned loop: 3-frame animation from the top row of piker_sheet, loops.
        // Plays for the remainder of hitstun after the impact animation finishes.
        if (!scene.anims.exists('piker_hit')) {
            scene.anims.create({
                key: 'piker_hit',
                frames: scene.anims.generateFrameNumbers('piker_hit_sheet', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1,
            });
        }

        // When the one-shot impact animation ends, transition to the stunned loop.
        this.on('animationcomplete', (anim) => {
            if (anim.key === 'piker_impact' && this.inAnimationLoop > 0) {
                this.play('piker_hit');
            }
        });

        this.play('piker_walk');

        // ── Initial direction ────────────────────────────────────────────
        if (this.direction === 'right') {
            this.changeDirection();
        }
    }

    // ── Lifecycle ────────────────────────────────────────────────────────

    update() {
        if (this.bounceCooldown > 0) this.bounceCooldown--;

        // Keep the hitbox glued to the piker sprite
        if (this.constantHitbox) {
            if (this.flipX === false) {
                this.constantHitbox.x = this.body.position.x + this.constantHitboxOffset.x;
                this.constantHitbox.y = this.body.position.y + this.constantHitboxOffset.y;
            } else {
                this.constantHitbox.x = this.body.position.x - this.constantHitboxOffset.x + this.bodySize.x;
                this.constantHitbox.y = this.body.position.y + this.constantHitboxOffset.y;
            }
        }

        if (this.inAnimationLoop === 0) {
            this.body.setVelocityX(0);
            if (this.hitboxCollider) this.hitboxCollider.active = true;
            // Recover to walk once hitstun ends (covers both impact and stunned states).
            const key = this.anims.currentAnim?.key;
            if (key === 'piker_hit' || key === 'piker_impact') {
                this.play('piker_walk');
            }
        } else {
            this.inAnimationLoop--;
            // Start the one-shot impact animation when the bounce begins.
            // animationcomplete will switch it to the looping piker_hit once done.
            // No setOffset() needed — all sheets use the same 24 px frame width.
            if (this.anims.currentAnim?.key !== 'piker_impact' &&
                this.anims.currentAnim?.key !== 'piker_hit') {
                this.play('piker_impact');
            }
        }

        if (this.isHit > 0) {
            this.isHit--;
            this.tint = 0x000000;
            if (this.hitboxCollider) this.hitboxCollider.active = false;

        } else if (this.isHit === 0) {
            this.tint = 0xffffff;
            this.isHit = -1;
            this.instructions = [];
            if (this.hitboxCollider) this.hitboxCollider.active = true;

        } else {
            this.DoInstructions();
        }
    }

    // ── Instruction dispatch (adds 'bounce' and 'disabled') ─────────────

    _executeInstruction(instruction) {
        switch (instruction.action) {
            case 'bounce':   this.DoBounce(instruction.option);    break;
            case 'disabled': this.DoDisabled(instruction.option);  break;
            default:         super._executeInstruction(instruction); break;
        }
    }

    // ── Piker-specific Do-methods ────────────────────────────────────────

    /**
     * Launch the piker in a direction after being bounced by the player.
     * The hitbox is disabled during the animation so the player can't be
     * hit while the piker is flying away.
     */
    DoBounce(direction) {
        const vy = -this.scene.gravity / 12;
        switch (direction) {
            case 'left':
                if (this.hitboxCollider) this.hitboxCollider.active = false;
                this.body.setVelocityX(-150);
                this.body.setVelocityY(vy);
                this.instructions = [];
                this.blockInstructions(150);
                break;
            case 'right':
                if (this.hitboxCollider) this.hitboxCollider.active = false;
                this.body.setVelocityX(150);
                this.body.setVelocityY(vy);
                this.instructions = [];
                this.blockInstructions(150);
                break;
            case 'up':
                if (this.hitboxCollider) this.hitboxCollider.active = false;
                this.body.setVelocityY(vy);
                this.instructions = [];
                this.blockInstructions(150);
                break;
        }
    }

    /** Freeze the piker in place for `frames` frames (e.g. after being hit). */
    DoDisabled(frames) {
        this.body.setVelocity(0);
        if (frames > 1) {
            this.SetInstruction({ action: 'disabled', option: (frames - 1) });
        }
    }

    /**
     * Override to suppress the black tint that Character.blockInstructions() applies.
     * blockInstructions re-queues itself every frame via the 'blockI' instruction,
     * so the tint must be cleared here (not in update) or it gets reapplied each frame.
     * The hit animation already provides visual feedback.
     */
    blockInstructions(frames) {
        super.blockInstructions(frames);
        this.tint = 0xffffff;
    }

    /** Override changeDirection to also flip patrol speed sign. */
    changeDirection() {
        super.changeDirection();
        this.speed = -this.speed;
    }

    // ── Collision handlers ───────────────────────────────────────────────

    /**
     * Called when the player overlaps the piker's constant hitbox.
     * Delegates all hit logic to player.getHit() so this class never
     * directly manipulates player.isHit.
     */
    handlePlayerHit(player, enemy) {
        player.getHit(enemy.x);
    }

    /**
     * Called when the player's physics body collides with the piker's body.
     * Resolves four cases: head-stomp, side-push, underside-bump.
     *
     * Bug fix: if the player is already in hit-stun, skip all velocity changes
     * to prevent both sprites launching upward together.
     */
    pikerBounce(player, piker) {
        // Don't apply extra forces while the player is already in hit recovery
        if (player.isHit >= 0) return;
        // Short cooldown after each bounce — breaks the ground-sandwich loop
        // without blocking re-hits during the rest of the piker's arc.
        if (this.bounceCooldown > 0) return;

        player.instructions = [];
        piker.instructions  = [];

        const headStomp   = player.y <= piker.y - 15;
        const undersideBump = player.y > piker.y + 15;

        if (headStomp) {
            player.SetInstruction({ action: 'rebound', option: 'top' });
            piker.SetInstruction({  action: 'bounce',  option: 'up'  });
            player.stompSfx.play({ delay: 0 });
            this.bounceCooldown = 20;
            return;
        }

        if (undersideBump) {
            player.SetInstruction({ action: 'rebound', option: 'bottom' });
            piker.SetInstruction({  action: 'bounce',  option: 'up' });
            player.stompSfx.play({ delay: 0 });
            this.bounceCooldown = 20;
            return;
        }

        // Side collision
        if (player.x < piker.x) {
            player.SetInstruction({ action: 'rebound', option: 'left'  });
            piker.SetInstruction({  action: 'bounce',  option: 'right' });
            player.bumpSfx.play({ delay: 0 });
        } else if (player.x > piker.x) {
            player.SetInstruction({ action: 'rebound', option: 'right' });
            piker.SetInstruction({  action: 'bounce',  option: 'left'  });
            player.bumpSfx.play({ delay: 0 });
        }
        this.bounceCooldown = 20;
    }
}

// ── Plugin wrapper ────────────────────────────────────────────────────────────
export class PikerPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);
        pluginManager.registerGameObject('piker', this.createPiker);
    }

    createPiker(params) {
        return new Piker({ scene: this.scene, ...params });
    }
}
