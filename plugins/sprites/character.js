/**
 * Character — base class for all physics-enabled sprites (Player, Piker, etc.)
 *
 * Subclasses extend this to inherit shared physics setup, the update loop,
 * the instruction stack, and all movement methods. They only need to add
 * their own constructor properties and type-specific behaviour.
 */
export class Character extends Phaser.GameObjects.Sprite {

    constructor({ scene, x, y, image, name, speed, playable, type,
        simpleInstruction, bodyOffset, bodySize, bounce }) {

        super(scene, x, y, image);

        // ── Hit / animation state ────────────────────────────────────────
        this.isHit = -1;            // frames remaining in hit-stun (-1 = not hit)
        this.inAnimationLoop = 0;   // frames to lock velocity (for scripted moves)
        this.instructionsLength = 0;
        this.previousXPosition = undefined;
        this.previousXVelocity  = undefined;
        this.solidLayerCollider  = null;
        this.oneWayLayerCollider = null;
        this.instructions = [];

        // ── Config ───────────────────────────────────────────────────────
        this.type             = type             || '';
        this.name             = name             || 'anonymous';
        this.image            = image;
        this.speed            = speed            || 100;
        this.bounce           = bounce           || 0;
        this.bodyOffset       = bodyOffset       || { x: 0, y: 0 };
        this.bodySize         = bodySize         || { x: 16, y: 16 };
        this.playable         = playable         || false;
        this.simpleInstruction = simpleInstruction || { action: '', option: '' };

        // ── Physics setup ────────────────────────────────────────────────
        scene.physics.world.enable(this, 0);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        if (this.bodySize) {
            if (this.bodyOffset) {
                this.body.setOffset(this.bodyOffset.x, this.bodyOffset.y);
            }
            this.body.setSize(this.bodySize.x, this.bodySize.y, false);
        }

        this.body.setBounce(this.bounce);
        this.body.setCollideWorldBounds(true);

        // Tile-layer colliders are optional — scenes without a tilemap (e.g. StageSelect)
        // set solidLayer / oneWayLayer to null and add their own colliders separately.
        this.solidLayerCollider  = scene.solidLayer
            ? scene.physics.add.collider(this, scene.solidLayer)  : null;
        this.oneWayLayerCollider = scene.oneWayLayer
            ? scene.physics.add.collider(this, scene.oneWayLayer, null, (sprite, tile) => {
                // Process callback: return false to skip collision resolution.
                //
                // Strategy: use body.prev (position at the START of this physics
                // step, before movement) to determine which side the player came from.
                // This correctly handles both fast falls (no tolerance needed) and
                // the apex-inside-tile case (prev position was already inside = below).
                //
                // 1. If moving upward, always skip — jumping from below.
                if (sprite.body.velocity.y < 0) return false;
                // 2. If the player's feet were already below the tile top at the
                //    start of this frame, they entered from below — skip.
                const tileWorldTop = tile.pixelY + tile.layer.tilemapLayer.y;
                const prevBottom = sprite.body.prev.y + sprite.body.height;
                return prevBottom <= tileWorldTop;
            }, this)
            : null;

        this.setDepth(10);
    }

    // ── Lifecycle ────────────────────────────────────────────────────────

    update() {
        if (this.isHit > 0) {
            this.isHit--;
            if (this.oneWayLayerCollider) this.oneWayLayerCollider.active = false;

        } else if (this.isHit === 0) {
            this.isHit = -1;
            this.instructions = [];
            this.body.setBounce(this.bounce);
            if (this.oneWayLayerCollider) this.oneWayLayerCollider.active = true;

        } else {
            if (this.inAnimationLoop === 0) {
                this.body.setVelocityX(0);
            } else {
                this.inAnimationLoop--;
            }
            this.DoInstructions();
        }
    }

    // ── Instruction system ───────────────────────────────────────────────

    /** Push an instruction onto the stack. */
    SetInstruction(instruction) {
        if (!instruction.action) return;
        if (instruction.action === 'move' && !instruction.option) return;
        this.instructions.push(instruction);
    }

    /**
     * Drain the instruction stack and execute each entry.
     * Subclasses override _executeInstruction() to handle additional action types.
     */
    DoInstructions() {
        this.instructions.reverse();
        this.instructionsLength = this.instructions.length;

        // Fall back to simpleInstruction when stack is empty
        if (this.instructionsLength === 0 && this.simpleInstruction.action !== '') {
            this._executeInstruction(this.simpleInstruction);
        }

        while (this.instructionsLength > 0) {
            const instruction = this.instructions.pop();
            this.instructionsLength--;
            this._executeInstruction(instruction);
        }
    }

    /**
     * Dispatch a single instruction object to the appropriate Do-method.
     * Subclasses override this to add extra action types, calling super._executeInstruction()
     * for the base cases.
     */
    _executeInstruction(instruction) {
        switch (instruction.action) {
            case 'move':   this.DoMove(instruction.option);            break;
            case 'jump':   this.DoJump();                              break;
            case 'patrol': this.DoPatrol();                            break;
            case 'blockI': this.blockInstructions(instruction.option); break;
        }
    }

    // ── Do-methods ───────────────────────────────────────────────────────

    DoMove(direction) {
        switch (direction) {
            case 'left':  this.body.setVelocityX(-this.speed); break;
            case 'right': this.body.setVelocityX( this.speed); break;
        }
    }

    DoJump() {
        if (this.body.blocked.down) {
            this.body.setVelocityY(-this.scene.gravity / 3 * 1.025);
        }
    }

    DoHalt() {
        this.body.setVelocityX(0);
    }

    DoPatrol() {
        if (!this.body || this.isHit >= 0) return;

        const stuckInPlace = (
            this.previousXPosition === this.body.position.x &&
            this.body.position.x   === this.prepreXPosition
        );

        if (
            stuckInPlace ||
            (this.previousXVelocity < 0 && this.checkForCliff('left'))  ||
            (this.previousXVelocity > 0 && this.checkForCliff('right'))
        ) {
            this.changeDirection();
        }

        // Guard against spurious direction-flips on frame hiccups
        if (this.previousXPosition === this.body.position.x) {
            this.prepreXPosition = this.previousXPosition;
        } else {
            this.prepreXPosition = -1;
        }

        this.previousXPosition = this.body.position.x;

        if (this.body.velocity.x === 0) {
            this.body.setVelocityX(-this.speed);
        }

        this.previousXVelocity = this.body.velocity.x;
    }

    /**
     * Lock movement for `frames` frames (turns character black while locked).
     * Queues a 'blockI' instruction to carry the countdown across updates.
     */
    blockInstructions(frames) {
        this.instructions      = [];
        this.instructionsLength = 0;
        this.body.setVelocityX(this.body.velocity.x / 1.1);

        if (frames > 1) {
            this.SetInstruction({ action: 'blockI', option: (frames - 1) });
            this.tint = 0x000000;
        } else {
            this.tint = 0xffffff;
        }

        this.inAnimationLoop = frames - 1;
    }

    // ── Helper methods ───────────────────────────────────────────────────

    checkForCliff(side) {
        if (!this.scene.map) return false;   // no tilemap in scenes like StageSelect

        const offsetX  = side === 'left' ? -3 : this.body.width + 2;
        const offsetX2 = side === 'left' ? -4 : this.body.width + 3;

        const isEmptyTile = (tile) =>
            tile &&
            (!tile.properties['solid'] || tile.properties['solid'] === false);

        const tile1 = this.scene.map.getTileAtWorldXY(
            this.body.position.x + offsetX,  this.body.position.y + this.body.height, true, '', 'Solid');
        const tile2 = this.scene.map.getTileAtWorldXY(
            this.body.position.x + offsetX2, this.body.position.y + this.body.height, true, '', 'Solid');

        return this.body.blocked.down && isEmptyTile(tile1) && isEmptyTile(tile2);
    }

    /** Flip the sprite horizontally and mirror the physics body offset. */
    changeDirection() {
        if (this.flipX === false) {
            this.flipX = true;
            if (this.bodyOffset) {
                this.body.setOffset(
                    (-this.bodySize.x + this.bodyOffset.x + this.bodyOffset.x),
                    this.bodyOffset.y
                );
            }
        } else {
            this.flipX = false;
            if (this.bodyOffset) {
                this.body.setOffset(this.bodyOffset.x, this.bodyOffset.y);
            }
        }
    }
}

// ── Plugin wrapper ────────────────────────────────────────────────────────────
// Kept for backwards compatibility; scenes use the Player / Piker plugins instead.
export class CharacterPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager) {
        super(pluginManager);
        pluginManager.registerGameObject('character', this.createCharacter);
    }

    createCharacter(params) {
        return new Character({ scene: this.scene, ...params });
    }
}
