import { SceneParent } from '../SceneParent.js';

export class Level_1_2 extends SceneParent
{
    constructor(){
		super('level_1_2');
	}

    levelName = 'level_1_2';
    tilesetNameInTiled = 'level1';
    tilesetImageKey = 'tiles';

    cursors;
    player;
    tileset;
    map;
    nameLevel = 'Level 1';

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
                x: 330, y: 302,
                name: 'piker4',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
            {
                x: 412, y: 292,
                name: 'piker5',
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                type: 'piker',
            },
        ];
        this.spriteGroupArray.push(pikerGroup);

        const portalGroup = [
            {
                x: 120, y: 416,
                name: 'portal3',
                originScene: 'level_1_2',
                destinationScene: 'level_1_1',
                spawnPoint: { x: 72, y: 256 },
                type: 'portal',
                active: true,
            },
            {
                x: 232, y: 416,
                name: 'portal4',
                originScene: 'level_1_2',
                destinationScene: 'level_1_1',
                spawnPoint: { x: 232, y: 256 },
                type: 'portal',
                active: true,
            },
            {
                x: 408, y: 304,
                name: 'portal5',
                originScene: 'level_1_2',
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
            { x: 330, y: 402, image: 'key', color: 'red', type: 'key' },
        ];
        this.spriteGroupArray.push(keyGroup);

        const timeBonusGroup = [
            { x: 420, y: 360, image: 'timeBonus', type: 'timeBonus', bonus: 15 },
        ];
        this.spriteGroupArray.push(timeBonusGroup);

	}

    preload ()
    {
        this.load.tilemapTiledJSON('level_1_2', './assets/tilemaps/level_1_2.json');
        this.load.image('tileset_level_1_2', './assets/tilemaps/small_tileset_1.png');
        this.load.image('piker', './assets/piker.png');
        this.load.image('portal', './assets/portal.png');
        this.load.audio('level1_music', './assets/sounds/[NES+VRC6 Remix] - Vampire Savior - Vanity Paradise (Lei-Lei\'s Theme).mp3');

        super.preload();
    }

    create ()
    {
        super.create({
            mapKey: 'level_1_2',
            tilesetNameInTiled: 'small_tileset_1',
            tilesetImageKey: 'tileset_level_1_2',
            zoom: 1,
		});

        this.music = this.sound.add('level1_music', { loop: true });
        this.playMusic(this.music, { seek: window.level1MusicSeek ?? 0 });
        this.events.once('shutdown', () => {
            window.level1MusicSeek = this.music.seek;
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