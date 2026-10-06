import { SceneParent } from '../SceneParent.js';
import { sharedMethods } from '../sharedMethods.js';

/**
 * StageSelect — lobby scene between the title screen and levels.
 *
 * Extends SceneParent so it uses the same tilemap rendering pipeline,
 * player setup, and portal sprite system as the playable levels.
 *
 * Two portal sprites serve as doors:
 *   Left  → Level 1  (always open)
 *   Right → Level 2  (locked until Level 1 is completed)
 *
 * Completion is tracked in window.gameProgress (set by level_complete.js).
 */
export class StageSelect extends SceneParent {

    constructor() {
        super('stageSelect');
    }

    nameLevel = 'Stage Select';

    // Player spawns at tile-map centre, falls onto ground
    spawnPoint = { x: 144, y: 16 };

    init(data) {
        super.init(data);   // resets spriteGroupArray

        // ── World settings ────────────────────────────────────────────────
        this.tileDimensions = { width: 16, height: 16 };
        this.zoom = 2;          // matches level_1_1
        this.gravity = 600;

        // ── Player data ───────────────────────────────────────────────────
        this.playerData = { type: 'player' };

        // ── Portal / door data ────────────────────────────────────────────
        // Positions are in map-local coords; SceneParent.initSprite adds rPos.
        const level1Done = !!(window.gameProgress && window.gameProgress.level_1_2_completed);

        const portalGroup = [
            {
                // Left door — Level 1 (always open)
                type: 'portal',
                x: 96,
                y: 112,
                image: 'portal',
                active: true,
                originScene: 'stageSelect',
                destinationScene: 'level_1_1',
                spawnPoint: { x: 200, y: 240 },
            },
            {
                // Right door — Level 2 (locked until Level 1 cleared)
                type: 'portal',
                x: 192,
                y: 112,
                image: level1Done ? 'portal' : 'portalClosed',
                active: level1Done,   // locked until Level 1 (level_1_2) is completed
                // keyColor 'white' (0xffffff) keeps the closed-portal sprite untinted;
                // without it the portal plugin would apply a green tint.
                keyColor: level1Done ? '' : 'white',
                originScene: 'stageSelect',
                destinationScene: 'level_2_1',
                spawnPoint: { x: 96, y: 250 },
            },
        ];
        this.spriteGroupArray.push(portalGroup);
    }

    preload() {
        this.load.tilemapTiledJSON('stage_select', './assets/tilemaps/stage_select.json');
        this.load.image('tileset_stage_select', './assets/tilemaps/small_tileset_2.png');
        this.load.audio('stageselect_music', './assets/sounds/ducktales2-niagara.ogg');
        this.load.audio('course_clear_sfx', './assets/sounds/levelfinish.ogg');
        super.preload();
    }

    create() {
        window.level1MusicSeek = 0;
        window.level2MusicSeek = 0;

        super.create({
            mapKey: 'stage_select',
            tilesetNameInTiled: 'small_tileset_2',
            tilesetImageKey: 'tileset_stage_select',
        });

        this.music = this.sound.add('stageselect_music', { loop: true });

        if (window.lastRunData) {
            const jingle = this.sound.add('course_clear_sfx');
            jingle.play({ delay: 0 });
            this.time.delayedCall(2200, () => this.playMusic(this.music));
        } else {
            this.playMusic(this.music);
        }

        this.events.once('shutdown', () => this.music.stop());

        // ── Fix world + camera bounds ─────────────────────────────────────
        // The visible width is the map minus one tile column (the hidden col 25
        // buffer on the right).  Both the physics world bound and the camera
        // bound must use the same width so the player stops exactly at the
        // right edge of the viewport — no further.
        const VISIBLE_W = this.mapDimensions.x - this.tileDimensions.width; // 416 - 16 = 400

        this.physics.world.setBounds(
            this.rPos.x, this.rPos.y,
            VISIBLE_W, this.mapDimensions.y,
            true, true, true, true
        );

        // In screenshot mode SceneParent.createCamera fits the whole map, so
        // skip these level-select camera bounds (they would clamp that view).
        if (!window.SCREENSHOT_MODE) {
            this.cameras.main.setBounds(
                this.rPos.x, this.rPos.y,
                VISIBLE_W, this.mapDimensions.y
            );
        }

        // ── Door labels ───────────────────────────────────────────────────
        // Text is in world space (scrolls with camera).  Font sizes are chosen
        // so they read comfortably at 2× zoom (e.g. 8 px font → 16 px on screen).
        const level1Done = !!(window.gameProgress && window.gameProgress.level_1_2_completed);

        const labelStyle = {
            fontSize: '12px', fill: '#ffffff',
            stroke: '#000000', strokeThickness: 5,
            resolution: 2,
        };
        const lockedStyle = {
            fontSize: '6px', fill: '#888888',
            stroke: '#000000', strokeThickness: 1,
            resolution: 2,
        };

        // Left door (world x = 80 + rPos.x, portal top ≈ rPos.y + 240)
        this.add.text(
            96 + this.rPos.x,
            88 + this.rPos.y,
            '1',
            labelStyle
        ).setOrigin(0.5).setDepth(1);

        // Right door
        this.add.text(
            192 + this.rPos.x,
            88 + this.rPos.y,
            '2',
            labelStyle
        ).setOrigin(0.5).setDepth(1);

        if (!level1Done) {
            this.add.text(
                320 + this.rPos.x,
                226 + this.rPos.y,
                'clear Stage 1 to unlock',
                lockedStyle
            ).setOrigin(0.5).setDepth(15);
        }

        console.log(level1Done);
        console.log(window.gameProgress);

        // ── Information display ───────────────────────────────────────────
        const bigStyle = {
            fontSize: '12px', fill: '#ffffff',
            stroke: '#000000', strokeThickness: 0,
            resolution: 2,
        };
        const smallStyle = {
            fontSize: '10px', fill: '#cccccc',
            stroke: '#000000', strokeThickness: 0,
            wordWrap: { width: 170 },
            resolution: 2,
        };

        this.infoTitle = this.add.text(64 + this.rPos.x,  28 + this.rPos.y, '', bigStyle  ).setDepth(1);
        this.infoBody  = this.add.text(64  + this.rPos.x,  44 + this.rPos.y, '', smallStyle).setDepth(1);
        this.infoIcons = [];  // holds icon images + overlay texts; cleared on each setInfoDisplay call

        if (window.lastRunData) {
            const d = window.lastRunData;
            this.setInfoDisplay(`${d.levelName} Complete!`, d.timeString, d.collectedItems);
        } else {
            this.setInfoDisplay('     Stage Select', 'Press ⇩ button to enter an unlocked door.');
        }
    }

    setInfoDisplay(title, body, items = []) {
        this.infoTitle.setText(title);
        this.infoBody .setText(body);

        // Remove any icons from a previous call.
        this.infoIcons.forEach(obj => obj.destroy());
        this.infoIcons = [];

        // Render collected-item icons on the same line as the body text.
        // iconY centres the icon on the text baseline; iconX starts just after the text.
        const iconY  = this.infoBody.y + this.infoBody.height / 2;
        const startX = this.infoBody.x + this.infoBody.width + 6;
        items.forEach((item, index) => {
            const iconX = startX + index * 14;

            const img = this.add.image(iconX, iconY, `${item.type}_collected`).setDepth(1).setScale(0.75);
            if (item.color) img.setTint(sharedMethods.colorToHex(item.color));
            this.infoIcons.push(img);

            if (item.overlayText) {
                const txt = this.add.text(
                    iconX - 3.5 * item.overlayText.length,
                    iconY - 7,
                    item.overlayText,
                    { fontSize: '11px', fill: '#000', resolution: 2 }
                ).setDepth(16);
                this.infoIcons.push(txt);
            }
        });
    }

    update() {
        super.update();
    }

    // ── Override helpers ──────────────────────────────────────────────────

    /** Stage Select has no in-level timer — suppress the display. */
    createTimer()  { /* intentionally empty */ }
    updateTimer()  { /* intentionally empty */ }

    /**
     * Clear window.player before switching so that the destination level
     * always creates a fresh player (no carried-over clock / collected items).
     *
     * MUST be a class field, not a prototype method.  SceneParent defines
     * switchScene as a class field, which sets an own property on the instance.
     * Own properties shadow prototype methods, so a regular method here would be
     * silently ignored and SceneParent's version (which does NOT clear
     * window.player) would run instead.  Defining it as a class field here
     * overrides the parent's own property because subclass field initialisers
     * run after the superclass constructor.
     *
     * super.switchScene is unavailable in arrow class fields (super is not a
     * prototype method either), so we inline SceneParent.switchScene's logic.
     */
    switchScene = (destination, data) => {
        window.player = undefined;
        this.scene.start(destination, data);
        this.destroyAllGameObjects();
    };
}
