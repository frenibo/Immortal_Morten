import { SceneParent } from '../SceneParent.js';

export class Level_2_2 extends SceneParent
{
    constructor(){
		super('level_2_2');
	}

    levelName = 'level_2_2';
    tilesetNameInTiled = 'Level2';
    tilesetImageKey = 'tiles';

    cursors;
    player;
    tileset;
    map;
    nameLevel = 'Level 2';

    spawnPoint = {x: 232, y: 544};

    init(data){
        super.init(data);

        console.log(data);
		if(data) {
			if(data.type === 'portal') {
				this.spawnPoint.x = data.spawnPoint.x;
				this.spawnPoint.y = data.spawnPoint.y;
			}
		}

////////// World data

        this.tileDimensions = {
			width: 16,
			height: 16
		};

        this.zoom = 2; // Changes zoom of the camera. Default zoom = 1.

////////// Player data


        this.playerData = {
            //x: this.spawnPoint.x, // + this.rPos.x,
            //y: this.spawnPoint.y, // + this.rPos.y,
            type: 'player',
        }

        this.playableScene = true;
        this.playerSpeed = 200;
        this.playerBounce = 0.5;


        /*
		if(data.hasOwnProperty('origin')){
			if(data.origin === 'Lab1') {
                this.spawnPoint = {
                    x:220,
                    y:240
                }
            }
		}
        */

////////// Enemy data

        // spriteGroupArray is reset in SceneParent.init(), so we always rebuild here
        const pikerGroup = [
            {
                x: 304, y: 192,
                name: 'piker4',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 312, y: 224,
                name: 'piker5',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 312, y: 160,
                name: 'piker6',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 432, y: 128,
                name: 'piker7',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            /*
            {
                x: 48, y: 224,
                name: 'piker8',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            */
            {
                x: 194, y: 176,
                name: 'piker9',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 128, y: 80,
                name: 'piker10',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 64, y: 160,
                name: 'piker11',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 240, y: 48,
                name: 'piker12',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 128, y: 48,
                name: 'piker13',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
        ];
        this.spriteGroupArray.push(pikerGroup);

        const portalGroup = [
            {
                x: 368, y: 256,
                name: 'portal5',
                originScene: 'level_2_2',
                destinationScene: 'level_2_1',
                spawnPoint: { x: 376, y: 256 },
                type: 'portal',
                active: true,
            },
            {
                x: 336, y: 16,
                name: 'portal3',
                originScene: 'level_2_2',
                destinationScene: 'level_2_1',
                spawnPoint: { x: 48, y: 32 },
                type: 'portal',
                active: true,
            },
            {
                x: 48, y: 64,
                name: 'portal4',
                originScene: 'level_2_2',
                destinationScene: 'level_complete',
                spawnPoint: { x: 0, y: 0 },
                type: 'portal',
                active: false,
                keyColor: 'red',
                image: 'portalClosed',
            },
        ];
        this.spriteGroupArray.push(portalGroup);

        const keyGroup = [
            { x: 48, y: 224, image: 'key', color: 'red', type: 'key' },
        ];
        this.spriteGroupArray.push(keyGroup);

        const timeBonusGroup = [
            { x: 512, y: 160, image: 'timeBonus', type: 'timeBonus', bonus: 5 },
        ];
        this.spriteGroupArray.push(timeBonusGroup);

	}

    preload ()
    {
        this.load.tilemapTiledJSON('level_2_2', './assets/tilemaps/level_2_2.json');
        this.load.image('tileset_level_2_2', './assets/tilemaps/small_tileset_2.png');
        this.load.image('piker', './assets/piker.png');
        this.load.image('portal', './assets/portal.png');
        this.load.audio('level2_music', './assets/sounds/batman-stage2.ogg');

        super.preload();
    }

    create ()
    {
        super.create({
            mapKey: 'level_2_2',
            tilesetNameInTiled: 'small_tileset_2',
            tilesetImageKey: 'tileset_level_2_2',
            zoom: 1,
        });

        this.music = this.sound.add('level2_music', { loop: true });
        this.playMusic(this.music, { seek: window.level2MusicSeek ?? 0 });
        this.events.once('shutdown', () => {
            window.level2MusicSeek = this.music.seek;
            this.music.stop();
        });
    }

    update ()
    {
        if(super.update()){

		}else{

		}

        //console.log('mouse X: ', this.input.mousePointer.x);
        //console.log('mouse Y: ', this.input.mousePointer.y);

    }
}
