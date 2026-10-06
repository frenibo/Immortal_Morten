import { Character } from './character.js';

/**
 * Player — the user-controlled character.
 * Extends Character for all shared physics / movement logic.
 * Adds: item collection, progress tracking, portal cooldown, and the
 * 'rebound' instruction used when bouncing off enemies.
 */
export class Player extends Character {

    constructor({ scene, x, y, image = 'player', name, speed, playable, type,
        simpleInstruction, bodyOffset, bodySize, bounce,
        progressData, collectedItems, clock, portalCooldown }) {

        super({ scene, x, y, image, name, speed, playable, type,
            simpleInstruction, bodyOffset, bodySize, bounce });

        // ── Player-specific defaults ─────────────────────────────────────
        this.type   = 'player';
        this.name   = name   || 'player';
        this.image  = image;
        this.speed  = speed  || 200;
        this.bounce = bounce || 0.2;
        this.bodyOffset = bodyOffset || { x: 7,  y: 0  };
        this.bodySize   = bodySize   || { x: 16, y: 32 };

        // ── Progress / state ─────────────────────────────────────────────
        this.progressData   = progressData   || [];
        this.collectedItems = collectedItems || [];
        this.clock          = clock          || performance.now();
        this.portalCooldown  = portalCooldown || 0;
        this.airborneFrames  = 0;   // counts frames spent airborne; switch sprite after 8
        this.playable        = true;

        // Landing impact — adjust this value to taste.
        this.groundPoundThreshold = 250;  // minimum downward velocity (px/s) to trigger sound
        this.prevVelocityY = 0;
        this.wasGrounded   = false;

        // Pre-instantiate SFX so .play() fires with no allocation delay.
        this.hitSfx         = scene.sound.add('player_hit_sfx');
        this.collectSfx     = scene.sound.add('item_collect_sfx');
        this.stompSfx       = scene.sound.add('stomp_sfx');
        this.bumpSfx        = scene.sound.add('bump_sfx');
        this.groundPoundSfx = scene.sound.add('groundpound_sfx');
        this.jumpSfx          = scene.sound.add('jump_sfx');
        this.portalEnterSfx   = scene.sound.add('portal_enter_sfx');
        this.doorUnlockSfx    = scene.sound.add('door_unlock_sfx');
        this.doorLockedSfx    = scene.sound.add('door_locked_sfx');

        // Re-apply size/offset with player-specific defaults
        // (the base constructor used whatever was passed; these ensure correct defaults)
        this.body.setBounce(this.bounce);
        this.body.setOffset(this.bodyOffset.x, this.bodyOffset.y);
        this.body.setSize(this.bodySize.x, this.bodySize.y, false);

        // ── Walk animation ────────────────────────────────────────────────
        // player_walk.png: 4 frames × 30×32 px.
        // Body offset: (30 - 16) / 2 = 7 px — keeps the 16px body centred
        // in the 30px frame. Same offset used for all player textures.
        if (!scene.anims.exists('player_walk')) {
            scene.anims.create({
                key: 'player_walk',
                frames: scene.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1,
            });
        }

        // ── Hitstun animation ─────────────────────────────────────────────
        // player_hitstun.png: 2 frames × 30×32 px, loops while isHit > 0.
        if (!scene.anims.exists('player_hitstun')) {
            scene.anims.create({
                key: 'player_hitstun',
                frames: scene.anims.generateFrameNumbers('player_hitstun', { start: 0, end: 2 }),
                frameRate: 8,
                repeat: -1,
            });
        }
    }

    // ── Lifecycle ────────────────────────────────────────────────────────

    update() {
        super.update();

        if (this.portalCooldown > 0) {
            this.portalCooldown--;
        }

        // ── Landing sound ─────────────────────────────────────────────────
        // body.velocity.y is already zeroed on the landing frame, so compare
        // against the velocity captured on the previous frame.
        const grounded = this.body.blocked.down;
        if (grounded && !this.wasGrounded && this.prevVelocityY > this.groundPoundThreshold) {
            this.groundPoundSfx.play({ delay: 0 });
        }
        this.prevVelocityY = this.body.velocity.y;
        this.wasGrounded   = grounded;

        // ── Animation management ──────────────────────────────────────────
        // enteringPortal is set by portal.js just before the scene freezes;
        // skip all texture changes so the enter sprite stays visible.
        if (this.enteringPortal) return;

        // Switch between the walk cycle and the static idle sprite based on
        // horizontal movement. Skip during hit-stun so the tint logic in
        // Character.update() can run uninterrupted.
        if (this.isHit > 0) {
            // Play hitstun animation once (getHit starts it; guard prevents restart).
            if (this.anims.currentAnim?.key !== 'player_hitstun') {
                this.play('player_hitstun');
            }
        } else if (this.isHit === 0) {
            // Transition frame: super.update() decremented isHit from 1 → 0 this
            // frame (still in the isHit > 0 branch, so tint is still black).
            // Next frame super.update() sees isHit === 0, clears tint, sets -1.
            // Stop the hitstun animation now so recovery is instant.
            this.anims.stop();
            this.setTexture('player');
        } else {
            // Normal movement — airborne, walk, or idle.
            const grounded = this.body.blocked.down;
            const moving   = Math.abs(this.body.velocity.x) > 1;

            if (!grounded) {
                this.airborneFrames++;
                if (this.airborneFrames >= 10 && this.texture.key !== 'player_airborne') {
                    this.anims.stop();
                    this.setTexture('player_airborne');
                }
            } else {
                this.airborneFrames = 0;
            }

            if (grounded && moving) {
                if (this.texture.key !== 'player_walk') {
                    this.play('player_walk');
                }
            } else if (grounded && !moving) {
                if (this.texture.key !== 'player') {
                    this.anims.stop();
                    this.setTexture('player');
                }
            }
        }
        // body offset stays at 7 for all textures — all are 30px wide.
    }

    // ── Instruction dispatch (adds 'rebound') ────────────────────────────

    _executeInstruction(instruction) {
        switch (instruction.action) {
            case 'rebound': this.DoRebound(instruction.option); break;
            default:        super._executeInstruction(instruction); break;
        }
    }

    // ── Player-specific Do-methods ───────────────────────────────────────

    DoJump() {
        if (this.body.blocked.down) {
            super.DoJump();
            this.jumpSfx.play({ delay: 0 });
        }
    }

    DoMove(direction) {
        switch (direction) {
            case 'left':
                this.body.setVelocityX(-this.speed);
                this.flipX = true;
                break;
            case 'right':
                this.body.setVelocityX(this.speed);
                this.flipX = false;
                break;
        }
    }

    /**
     * Bounce the player away from a collision:
     *   'left' / 'right' — horizontal rebound (hit enemy from the side)
     *   'top'            — upward bounce (landed on enemy's head)
     *   'bottom'         — downward bounce (hit enemy from below)
     */
    DoRebound(direction) {
        switch (direction) {
            case 'left':
                this.body.setVelocityX(-100);
                this.body.setVelocityY(-30);
                this.instructions = [];
                this.blockInstructions(10);
                break;
            case 'right':
                this.body.setVelocityX(100);
                this.body.setVelocityY(-30);
                this.instructions = [];
                this.blockInstructions(10);
                break;
            case 'top':
                // Jump boost if player holds the jump key, smaller pop otherwise
                if (this.scene.cursors.up.isDown || this.scene.keyW.isDown) {
                    this.body.setVelocityY(-this.scene.gravity / 3 * 1.05);
                } else {
                    this.body.setVelocityY(-this.scene.gravity / 5);
                }
                break;
            case 'bottom':
                // Player bumped into the underside of an enemy — push downward
                this.body.setVelocityY(150);
                this.instructions = [];
                this.blockInstructions(10);
                break;
        }
    }

    // ── Hit response ─────────────────────────────────────────────────────

    /**
     * Apply a hit from an enemy at world-x position `enemyX`.
     * All hit-state logic is kept here so enemies never touch isHit directly.
     */
    getHit(enemyX) {
        if (this.isHit < 0) {
            this.isHit = 100;
            this.body.setVelocity(0);
            this.body.setBounce(0.4);
            const dir = enemyX > this.x ? -1 : 1;
            this.body.setVelocityX(dir * 80);
            this.body.setVelocityY(-150);
            this.play('player_hitstun');
            this.hitSfx.play({ delay: 0 });
        }
    }

    // ── Overrides ────────────────────────────────────────────────────────

    blockInstructions(frames) {
        super.blockInstructions(frames);
        this.tint = 0xffffff;   // suppress the black tint Character applies
    }

    // ── Item collection ──────────────────────────────────────────────────

    collectItem(item) {
        if (this.collectedItems.findIndex(find => find.name === item.name) === -1) {
            this.collectedItems.push(item);
            this.addProgress(item, '.destroyItem();');
            this.scene.updateInfoOverlay();
            this.collectSfx.play({ delay: 0 });
        }
    }

    addProgress(object, executionString) {
        this.progressData.push([object, executionString]);
    }
}

// ── Plugin wrapper ────────────────────────────────────────────────────────────
export class PlayerPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);
        pluginManager.registerGameObject('player', this.createPlayer);
    }

    createPlayer(params) {
        return new Player({ scene: this.scene, ...params });
    }
}
