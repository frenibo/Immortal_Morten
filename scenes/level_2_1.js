import { SceneParent } from '../SceneParent.js';

export class Level_2_1 extends SceneParent
{
    constructor(){
		super('level_2_1');
        //super({key:'level_1'});

		//this.portals.lab = 'Lab1';
	}

    cursors;
    player;
    tileset;
    map;
    nameLevel = 'Level 2';

    spawnPoint = {x: 200, y: 240};

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

        this.gravity = 600;
       
////////// Player data

        this.playerData = {
            //x: this.spawnPoint.x, // + this.rPos.x,
            //y: this.spawnPoint.y, // + this.rPos.y,
            type: 'player',
        }

        this.playableScene = true;
        //this.playerSpeed = 200;
        //this.playerBounce = 0.5;

        
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
                type: 'piker',
                name: 'piker1',
                x: 180,
                y: 260,
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
            },
            {
                type: 'piker',
                name: 'piker2',
                x: 400,
                y: 60,
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
            },
            {
                type: 'piker',
                name: 'piker3',
                x: 140,
                y: 150,
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                direction: 'right',
            },
            {
                type: 'piker',
                name: 'piker4',
                x: 400,
                y: 120,
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
            },
        ];
        this.spriteGroupArray.push(pikerGroup);

        const portalGroup = [
            /*
            {
                x: 72,
                y: 256,
                originScene: 'level_1_1',
                destinationScene: 'level_1_2',
                spawnPoint: { x: 120, y: 430 },
                type: 'portal',
                active: false,
                keyColor: 'aqua',
                image: 'portalClosed',
            },
            */
            {
                x: 48, y: 32,
                name: 'portal1',
                originScene: 'level_2_1',
                destinationScene: 'level_2_2',
                spawnPoint: { x: 336, y: 0 },
                type: 'portal',
                active: true,
            },
            {
                x: 376,
                y: 256,
                name: 'portal2',
                originScene: 'level_2_1',
                destinationScene: 'level_2_2',
                spawnPoint: { x: 368, y: 254 },
                type: 'portal',
                active: false,
                keyColor: 'lightgrey',
                image: 'portalClosed',
            },
        ];
        this.spriteGroupArray.push(portalGroup);

        const keyGroup = [
            //{ x: 220, y: 185, image: 'key', color: 'aqua',      type: 'key' },
            { x: 288, y: 234, image: 'key', color: 'lightgrey',  type: 'key' },
        ];
        this.spriteGroupArray.push(keyGroup);

        const timeBonusGroup = [
            { x: 520, y: 256, image: 'timeBonus', type: 'timeBonus', bonus: 2 },
            { x: 96, y: 32, image: 'timeBonus', type: 'timeBonus', bonus: 7 },
        ];
        this.spriteGroupArray.push(timeBonusGroup);
	}

    preload ()
    {
        this.load.tilemapTiledJSON('level_2_1', './assets/tilemaps/level_2_1.json');
        this.load.image('tileset_level_1', './assets/tilemaps/small_tileset_2.png');
        this.load.audio('level2_music', './assets/sounds/batman-stage2.ogg');

        super.preload();
    }

    create ()
    {
        // super.create() completes all the nonspecific initial steps in create() of a scene.
        super.create({
            mapKey: 'level_2_1',
            tilesetNameInTiled: 'small_tileset_2',
            tilesetImageKey: 'tileset_level_1',
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