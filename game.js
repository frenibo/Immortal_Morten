// TODO: Fix bug where the player gets trapped underneath a piker standing on a one-way platform. (Level 2.2)

import Phaser from 'phaser';

import { CharacterPlugin } from "./plugins/sprites/character.js";
import { PlayerPlugin } from "./plugins/sprites/player.js";
import { PikerPlugin } from "./plugins/sprites/piker.js";
import { PortalPlugin } from "./plugins/sprites/portal.js";
import { KeyPlugin } from "./plugins/sprites/key.js";
import { TimeBonusPlugin } from "./plugins/sprites/timeBonus.js";

import { sharedMethods } from "./sharedMethods.js";

import { TitleScreen } from "./scenes/titlescreen.js";
import { StageSelect } from "./scenes/stageSelect.js";
import { Level_1_1 } from "./scenes/level_1_1.js";
import { Level_1_2 } from "./scenes/level_1_2.js";
import { Level_2_1 } from "./scenes/level_2_1.js";
import { Level_2_2 } from "./scenes/level_2_2.js";
import { Level_Complete } from "./scenes/level_complete.js";
import { UIScene } from "./scenes/uiScene.js";

// Global progress tracker — persists between scene transitions for this session.
window.gameProgress = window.gameProgress || {};

var titleScreen  = new TitleScreen();
var stageSelect  = new StageSelect();
var level_1_1    = new Level_1_1();
var level_1_2    = new Level_1_2();
var level_2_1    = new Level_2_1();
var level_2_2    = new Level_2_2();
var level_complete = new Level_Complete();
var uiScene        = new UIScene();

// ==== TEMPORARY: SCREENSHOT MODE (set to false to restore normal play) ====
// Enlarges the canvas and makes every scene's camera show the whole stage,
// centered and without following the player — for taking full-stage screenshots.
// Reverse this change by setting SCREENSHOT_MODE to false.
// (Also read by SceneParent.createCamera and scenes/stageSelect.js.)
const SCREENSHOT_MODE = false;
window.SCREENSHOT_MODE = SCREENSHOT_MODE;
// ==========================================================================

const config = {
	type: Phaser.AUTO,
	//canvas dimensions
	width:  SCREENSHOT_MODE ? 1152 : 576,
	height: SCREENSHOT_MODE ? 960  : 320,
	//width: 800,
	//height: 600,
	backgroundColor: "000000",
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {y: 600},
			tileBias: 16,
			enableBody: true,
			debug: false,
		}
	},
	plugins: {
        global: [
            { key: 'CharacterPlugin', plugin: CharacterPlugin, start: true },
			{ key: 'PlayerPlugin', plugin: PlayerPlugin, start: true },
			{ key: 'PikerPlugin', plugin: PikerPlugin, start: true },
			{ key: 'PortalPlugin', plugin: PortalPlugin, start: true },
			{ key: 'KeyPlugin', plugin: KeyPlugin, start: true },
			{ key: 'TimeBonusPlugin', plugin: TimeBonusPlugin, start: true },
		]
    },
	scene: [
		titleScreen,
		stageSelect,
		level_1_1,
		level_1_2,
		level_2_1,
		level_2_2,
		level_complete,
		uiScene,
	]
};

const game = new Phaser.Game(config);