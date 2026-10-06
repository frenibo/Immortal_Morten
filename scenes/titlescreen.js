export class TitleScreen extends Phaser.Scene {

    constructor() {
        super({key:'titleScreen'});
    };

    gameTitle = 'Immortal Morten';

    preload () {
        this.load.image('title_screen', './assets/title_screen.png');
        this.load.audio('title_music', './assets/sounds/Battletoads (NES) Music - Title Theme With Drums.mp3');
        this.load.audio('title_select_sfx', './assets/sounds/message.ogg');
    }

    create () {
        const { width, height } = this.scale;

        // Background — stretch to fill the canvas
        this.add.image(width / 2, height / 2, 'title_screen')
            .setDisplaySize(width, height);

        // "Press ⬆ to play" — lower-left area, cycling arcade colors
        const promptText = this.add.text(width * 0.08, height * 0.92, 'Press ⇧ button to play', {
            fontSize: '20px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            resolution: 2,
        });

        const colors = ['#ffffff', '#ffff00', '#ff4444', '#44ffff', '#ff44ff', '#44ff44', '#ff8800'];
        let colorIndex = 0;
        this.time.addEvent({
            delay: 80,
            loop: true,
            callback: () => {
                colorIndex = (colorIndex + 1) % colors.length;
                promptText.setStyle({ fill: colors[colorIndex] });
            },
        });

        this.music = this.sound.add('title_music', { loop: true });
        this.music.play();
        if (window.soundState === 1 || window.soundState === 2) this.music.setMute(true);

        this.selectSfx = this.sound.add('title_select_sfx');

        this.input.keyboard.on('keydown-UP', () => {
            window.lastRunData = undefined;
            window.player = undefined;
            this.input.keyboard.enabled = false;
            this.music.stop();
            this.selectSfx.play({ delay: 0 });
            this.scene.pause();
            setTimeout(() => {
                this.scene.start('stageSelect');
            }, 672);
        });
    }
    
    update () {
    
    }
}

export default TitleScreen;