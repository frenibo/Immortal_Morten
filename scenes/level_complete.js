import { SceneParent } from '../SceneParent.js';
import { sharedMethods } from "../sharedMethods.js";

export class Level_Complete extends Phaser.Scene
{
    constructor(){
		super({key:'level_complete'});
	}

    previousScene;
    rankingList;
    timeScore = performance.now();
    highscore = false;
    username = 'noUsername';

    init(data){
        // NOTE: `data` is the Portal game object.  By the time this runs Phaser has
        // already shut down the origin scene and called destroy() on all its game
        // objects, which clears the built-in `type` property to ''.  Checking
        // `data.type === 'portal'` therefore always fails.  Instead we check the
        // custom `originScene` property, which Phaser's destroy() leaves intact.
        if (data && data.originScene) {
            this.previousScene = data.thisScene ? data.thisScene.nameLevel : '';

            // Record completion so StageSelect can unlock the next door.
            window.gameProgress = window.gameProgress || {};
            window.gameProgress[data.originScene + '_completed'] = true;
        }
    }

    preload ()
    {

    }

    create ()
    {
        // Snapshot run data before clearing the player object.
        const timeScore = window.player ? performance.now() - window.player.clock : 0;
        window.lastRunData = {
            levelName:      this.previousScene,
            timeString:     this.convertNumToTimeElapsed(timeScore),
            collectedItems: window.player ? [...window.player.collectedItems] : [],
        };
        window.player = undefined;
        this.scene.start('stageSelect');
    }

    update ()
    {

    }

    createTimer() {
        //this.timer = this.add.text(400, 230, 'Click to Start.', { fontSize: '15px', fill: '#000' }).setScrollFactor(0).setDepth(11);
        //console.log(performance.now())
        if(window.player.clock) {
            this.timerDisplay = this.add.text(200, 200, '00:00:00', { fontSize: '20px', fill: '#fff', resolution: 2 }).setScrollFactor(0).setDepth(11);
            this.timeScore = performance.now()-window.player.clock;
            this.timerDisplay.setText(`${this.convertNumToTimeElapsed(this.timeScore)}`);
        }
    }

    convertNumToTimeElapsed(ms) {
        let date = new Date(null);
        date.setMilliseconds(ms); // specify value for SECONDS here
        let result = date.toISOString().slice(14, 22);
        return result
    }

    createInfoOverlay() {
		console.log('updateInfoOverlay()');
		window.player.collectedItems.forEach((item, index) => {
			//let image = this.add.image((this.cameras.main.centerX - this.rPos.x)*2 +14 -index*14, 440, `${item.type}_collected`).setScrollFactor(0); // 592, 440
			let image = this.add.image(200-8-index*16, 200, `${item.type}_collected`).setScrollFactor(0).setDepth(11); // TODO: Werte dynamisch berechnen.
			if(item.overlayText) {
				this.add.text(200-8-index*16-3.5*item.overlayText.length, 200-7, item.overlayText, { fontSize: '11px', fill: '#000', resolution: 2 }).setScrollFactor(0).setDepth(12);
			}
			if(item.color) {
				image.tint = sharedMethods.colorToHex(item.color);
			}
			//let image = this.add.image(this.canvasDimensions.width + this.rPos.x -20, this.canvasDimensions.height + this.rPos.y -20, `${item.type}_collected`).setScrollFactor(0);
			console.log((this.cameras.main.centerX)*2)
		})
	}

    compareRanking() {

    }

    writeToFile(data) {
        const fs = require('fs');
        const filepath = '../storage/ranking.json';
        //const data = JSON.parse(fs.readFileSync(filepath));
        //data[someKey] = "newValue";
        fs.writeFileSync(filepath, JSON.stringify(data, null, 4));
    }

    async fetchRankingList() {
        return await fetch('../storage/ranking.json')
            .then(response => response.json())
            .then(data => this.rankingList = data)
            .catch(error => console.log(error));

    }
}