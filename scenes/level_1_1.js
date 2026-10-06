import { SceneParent } from '../SceneParent.js';

export class Level_1_1 extends SceneParent
{
    constructor(){
        super('level_1_1');
    }

    nameLevel = 'Level 1';

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

        this.zoom = 2;

        this.gravity = 600;

////////// Player data

        this.playerData = {
            type: 'player',
        }

        this.playableScene = true;

////////// Enemy data

        // spriteGroupArray is reset in SceneParent.init(), so we always rebuild here
        const pikerGroup = [
            {
                type: 'piker',
                name: 'piker_2_1',
                x: 330,
                y: 230,
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
            },
            {
                type: 'piker',
                name: 'piker_2_2',
                x: 80,
                y: 150,
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
                direction: 'right',
            },
            {
                type: 'piker',
                name: 'piker_2_3',
                x: 330,
                y: 150,
                constantHitbox: { offsetX: -6, offsetY: 8, width: 6, height: 10, color: 0xff0000, alpha: 0.5 },
            },
        ];
        this.spriteGroupArray.push(pikerGroup);

        const portalGroup = [
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
            {
                x: 232,
                y: 256,
                originScene: 'level_1_1',
                destinationScene: 'level_1_2',
                spawnPoint: { x: 232, y: 416 },
                type: 'portal',
                active: false,
                keyColor: 'lightgrey',
                image: 'portalClosed',
            },
        ];
        this.spriteGroupArray.push(portalGroup);

        const keyGroup = [
            { x: 220, y: 185, image: 'key', color: 'aqua',      type: 'key' },
            { x: 170, y: 250, image: 'key', color: 'lightgrey',  type: 'key' },
        ];
        this.spriteGroupArray.push(keyGroup);

        const timeBonusGroup = [
            { x: 420, y: 80, image: 'timeBonus', type: 'timeBonus', bonus: 5 },
        ];
        this.spriteGroupArray.push(timeBonusGroup);
    }

    preload()
    {
        this.load.tilemapTiledJSON('level_1_1', './assets/tilemaps/level_1_1.json');
        this.load.image('tileset_level_1_1', './assets/tilemaps/small_tileset_1.png');
        this.load.audio('level1_music', './assets/sounds/[NES+VRC6 Remix] - Vampire Savior - Vanity Paradise (Lei-Lei\'s Theme).mp3');
        super.preload();
    }

    create()
    {
        super.create({
            mapKey: 'level_1_1',
            tilesetNameInTiled: 'small_tileset_1',
            tilesetImageKey: 'tileset_level_1_1',
        });

        this.music = this.sound.add('level1_music', { loop: true });
        this.playMusic(this.music, { seek: window.level1MusicSeek ?? 0 });
        this.events.once('shutdown', () => {
            window.level1MusicSeek = this.music.seek;
            this.music.stop();
        });
    }

    update()
    {
        super.update();
    }
}
