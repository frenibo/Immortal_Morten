import { sharedMethods } from "../../sharedMethods.js";

export class Portal extends Phaser.GameObjects.Sprite {

    constructor({ scene, x = 0, y = 0, image = 'portal', name, bodyOffset, bodySize, active, indexArray, indexGroup, originScene, destinationScene, type, spawnPoint, keyColor}){

        super(scene, x, y, image);

////////// Non-Init attributes

////////// General-Init attributes
        this.name = name || `portal_${indexArray}_${indexGroup}_${scene.scene.key}`;
        this.image = image || 'portal';
        this.bodyOffset = bodyOffset || {x: 4, y: 16};
        this.bodySize = bodySize || {x: 8, y: 16};
        this.active = active || false;
        this.indexArray = indexArray;
        this.indexGroup = indexGroup;
        this.originScene = originScene || this.scene.scene.key;
        this.destinationScene = destinationScene || 'level_1';
        this.spawnPoint = spawnPoint || {x: 0, y: 0};
        this.type = type || 'portal';
        this.keyColor = keyColor || "";
        this.thisScene = this.scene;
        
////////// Player-Init attributes
        
        
////////// Enemy-Init attributes
        
        
////////// Physics Initialization

        // Attach this sprite to the loaded physics engine
        scene.physics.world.enable(this, 0);
        // Add this sprite to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);

        if(this.bodySize) {
            if(this.bodyOffset) {
				this.body.setOffset(this.bodyOffset.x, this.bodyOffset.y);
			}
			this.body.setSize(this.bodySize.x, this.bodySize.y, false);
		}

        if(this.active == false) {
            if(this.keyColor) {
                this.tint = sharedMethods.colorToHex(this.keyColor);
            }
            else {
                this.tint = sharedMethods.colorToHex('green');
            }

        }

        this.body.setAllowGravity(false);

        this.setDepth(9);

        scene.physics.add.overlap(window.player.body, this.body, () => this.handlePlayerPortalOverlap(window.player, this), null, this);
    }

    update(){
        
    }

//// Do-Instruction Methods


///// Helper Methods
    handlePlayerPortalOverlap(player, portal) {
        if(portal.active == true) {
            //portal.playerOverlap = true;
            if( window.player.portalCooldown == 0) {
                if(this.scene.cursors.down.isDown || this.scene.keyS.isDown) {
                    this.scene.input.stopPropagation();
                    this.enterPortal(this);
                }
            }
        }
        if(portal.active == false) {
            const hasKey = player.collectedItems.findIndex(item => (item.type === 'key' && item.color === this.keyColor)) !== -1;
            if(player.body.blocked.down && player.isHit === -1 && hasKey) {
                this.unlockPortal(player);
            } else if(!hasKey && window.player.portalCooldown == 0 && (this.scene.cursors.down.isDown || this.scene.keyS.isDown)) {
                // Player tries to enter a locked door without the key — show enter sprite briefly.
                window.player.enteringPortal = true;
                window.player.anims.stop();
                window.player.setTexture('player_enter');
                window.player.doorLockedSfx.play({ delay: 0 });
                window.player.portalCooldown = 30;
                this.scene.time.delayedCall(300, () => {
                    if (window.player) window.player.enteringPortal = false;
                });
            }
        }
    }

    enterPortal(portal) {
        console.log(portal.name);
        if(portal.destinationScene){
            // When destination is in same scene
            if(portal.destinationScene == this.scene.scene.key) {
                window.player.body.setVelocityX(0);
                window.player.body.setVelocityY(0);
                window.player.body.x = portal.spawnPoint.x + this.scene.scene.scene.rPos.x -8;
                window.player.body.y = portal.spawnPoint.y + this.scene.scene.scene.rPos.y -16;
            }
            // When destination is in another scene
            else if(portal.destinationScene != this.scene.scene.key) {
                const portalData = {
                    type: 'portal',
                    originScene: portal.originScene,
                    destinationScene: portal.destinationScene,
                    spawnPoint: { x: portal.spawnPoint.x, y: portal.spawnPoint.y },
                    thisScene: portal.thisScene,
                };
                // Freeze the scene visually for 400 ms, then switch.
                // setTimeout runs outside Phaser's loop so it survives the pause.
                const sceneRef = this.scene;
                window.player.enteringPortal = true;
                window.player.anims.stop();
                window.player.setTexture('player_enter');
                window.player.portalEnterSfx.play({ delay: 0 });
                sceneRef.scene.pause();
                setTimeout(() => {
                    sceneRef.switchScene(portal.destinationScene, portalData);
                }, 400);
                return;
            }
            // Guard: switchScene (in StageSelect) may clear window.player before
            // this line runs, so only assign if the player object still exists.
            if (window.player) window.player.portalCooldown = 30;
        }
    }

    unlockPortal(player) {
        player.DoHalt();
        player.blockInstructions(30);
        player.doorUnlockSfx.play({ delay: 0 });

        // Show key_collected icon above the portal, tinted to match the door colour.
        // Duration mirrors blockInstructions(30): 30 frames × (1000 ms / 60 fps) ≈ 500 ms.
        const icon = this.scene.add.image(this.x, this.y - 20, 'key_collected');
        icon.setTint(sharedMethods.colorToHex(this.keyColor));
        icon.setDepth(20);
        this.scene.time.delayedCall(500, () => { if (icon.active) icon.destroy(); });

        this.active = true;
        this.tint = sharedMethods.colorToHex('white');
        this.setTexture('portal');
        player.addProgress(this, '.active = true;');
        player.addProgress(this, '.setTexture("portal");');
    }
}

export class PortalPlugin extends Phaser.Plugins.BasePlugin {

    constructor(pluginManager){
        super(pluginManager);

        //  Register our new Game Object type
        pluginManager.registerGameObject('portal', this.createPortal);
    }

    createPortal(params){
        //return this.displayList.add(new RpgCharacter({scene: this.scene, ...params}));
        return new Portal({scene: this.scene, ...params});
    }

}