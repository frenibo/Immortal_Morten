/**
 * UIScene — always-on overlay for global controls.
 * Runs in parallel with every other scene; never stops.
 *
 * Sound states:
 *   0  🔊  all sounds on
 *   1  🔇  all sounds off
 *   2  🎵  SFX on, scene music muted
 *
 * Keyboard shortcuts:
 *   C  — cycle the sound state (same as clicking the sound button)
 *   X  — leave the current stage (same as the ✕ button; only while in a level)
 */
export class UIScene extends Phaser.Scene {

    constructor() {
        super({ key: 'UIScene', active: true });
    }

    // Keys that count as "scene music" for state 2.
    MUSIC_KEYS = ['title_music', 'level1_music', 'level2_music', 'stageselect_music'];

    soundState = 0;
    // ♫ = all on  |  ∅ = all off  |  ♩ = sfx only (music muted)
    LABELS = ['♫', '∅', '♩'];

    create() {
        window.soundState = 0;

        this.btn = this.add.text(8, this.scale.height - 8, this.LABELS[0], {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            resolution: 2,
        })
        .setOrigin(0, 1)
        .setDepth(999)
        .setInteractive({ useHandCursor: true });

        this.btn.on('pointerdown', () => this.cycleSound());

        const LEVEL_KEYS = ['level_1_1', 'level_1_2', 'level_2_1', 'level_2_2'];

        const btnStyle = {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            resolution: 2,
        };

        const exitBtn = this.add.text(28, this.scale.height - 8, '✕', btnStyle)
            .setOrigin(0, 1)
            .setDepth(999)
            .setInteractive({ useHandCursor: true });

        exitBtn.on('pointerdown', () => this.exitStage());

        this.timerText = this.add.text(46, this.scale.height - 8, '00:00.00', btnStyle)
            .setOrigin(0, 1)
            .setDepth(999);

        this.exitBtn    = exitBtn;
        this.LEVEL_KEYS = LEVEL_KEYS;

        // Keyboard shortcuts for the overlay buttons.
        // C mirrors the sound button; X mirrors the ✕ exit button.
        this.keyC = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.keyX = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    }

    convertNumToTimeElapsed(ms) {
        const date = new Date(null);
        date.setMilliseconds(ms);
        return date.toISOString().slice(14, 22);
    }

    isInLevel() {
        return this.LEVEL_KEYS.some(key =>
            this.scene.manager.isActive(key) || this.scene.manager.isPaused(key));
    }

    update() {
        const inLevel = this.isInLevel();
        this.exitBtn.setVisible(inLevel);
        this.timerText.setVisible(inLevel);

        // Keyboard shortcuts (JustDown = once per press, ignores auto-repeat).
        if (Phaser.Input.Keyboard.JustDown(this.keyC)) this.cycleSound();
        if (inLevel && Phaser.Input.Keyboard.JustDown(this.keyX)) this.exitStage();

        if (inLevel && window.player?.clock) {
            this.timerText.setText(this.convertNumToTimeElapsed(performance.now() - window.player.clock));
        }
    }

    /** Cycle through the three sound states and apply them. */
    cycleSound() {
        this.soundState = (this.soundState + 1) % 3;
        window.soundState = this.soundState;
        this.btn.setText(this.LABELS[this.soundState]);
        this.applyState();
    }

    /** Leave the current stage and return to the stage select. */
    exitStage() {
        window.player      = undefined;
        window.lastRunData = undefined;
        const sm = this.scene.manager;
        sm.getScenes(true)
          .filter(s => s.sys.settings.key !== 'UIScene')
          .forEach(s => sm.stop(s.sys.settings.key));
        sm.start('stageSelect');
    }

    applyState() {
        this.game.sound.sounds.forEach(s => {
            switch (this.soundState) {
                case 0: s.setMute(false); break;
                case 1: s.setMute(true);  break;
                case 2: s.setMute(this.MUSIC_KEYS.includes(s.key)); break;
            }
        });
    }
}
