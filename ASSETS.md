# Asset Credits — Immortal Morten

This file documents the origin of every asset shipped with the game.

> **Note on copyright.** Many of the audio and graphic assets below are taken
> from commercial retro video games. They are **not our work** and remain the
> copyright of their respective owners. They were first used as placeholders
> during development and are still included in this unofficial, non-commercial
> fan project; no ownership is claimed and no infringement is intended. See the
> [Disclaimer](README.md#disclaimer). Rights holders can request removal by
> [opening an issue](https://github.com/frenibo/Immortal_Morten/issues).
>
> Origins were determined from file names, embedded metadata (GIMP/Tiled source
> files) and the developer's own notes.

## Graphics

| File(s) | Use | Origin / Source |
|---|---|---|
| `morten.png`, `player_walk.png`, `player_hitstun.png`, `player_airborne.png`, `player_enter.png` | Player character "Morten" | Based on the Wario sprite from *Wario Land 3* (Nintendo, Game Boy Color, 2000), **altered/adapted by the author** (GIMP) |
| `piker_sheet.png`, `piker_walk.png`, `piker_hit_sheet.png`, `piker_impact_sheet.png`, `piker.png` | Enemy "Piker" | Adapted from *Wario Land 3* (Nintendo, Game Boy Color, 2000); sprite rip |
| `key.png`, `key_collected.png` | Key (collectible) | *Wario Land 3* (Nintendo, Game Boy Color, 2000); sprite rip |
| `portal.png`, `portalClosed.png` | Door | Own work (GIMP) |
| `timeBonus.png` | Time bonus (collectible) | Own work (GIMP); `.xcf` source present |
| `title_screen.png` | Title screen image | Generated entirely with ChatGPT from the author's own prompts |
| `tilemaps/small_tileset_1.png`, `tilemaps/small_tileset_2.png` | Tilesets (World 1 / World 2) | Mostly from [*Pixel Adventure*](https://pixelfrog-assets.itch.io/pixel-adventure-1) by Pixel Frog (itch.io, **CC0 / public domain**); the rightmost tiles are from `sky.png` of the official Phaser 3 tutorial *"Making your first Phaser 3 game"* (Photon Storm) |

## Audio — Music

| File | Use | Origin / Source |
|---|---|---|
| `Battletoads (NES) Music - Title Theme With Drums.mp3` | Title screen | *Battletoads* (NES, Rare / Tradewest, 1991); music by David Wise |
| `[NES+VRC6 Remix] - Vampire Savior - Vanity Paradise (Lei-Lei's Theme).mp3` | World 1 | Original from *Vampire Savior / Darkstalkers 3* (Capcom, 1997), composed by Takayuki Iwai; here a fan-made NES/VRC6 remix |
| `batman-stage2.ogg` | World 2 | *Batman: The Video Game* (NES, Sunsoft, 1989), Stage 2; music by Naoki Kodaka & Nobuyuki Hara |
| `ducktales2-niagara.ogg` | Stage select | *DuckTales 2* (NES, Capcom, 1993), "Niagara Falls"; music by Minae Fujii |

## Audio — Sound effects

| File | Use | Origin / Source |
|---|---|---|
| `wario-hit-44k.ogg` | Player takes damage | *Wario Land* series (Nintendo); sound rip |
| `bigcoin.ogg` | Item collected | Nintendo (*Super Mario* / *Wario*); sound rip |
| `stomp.ogg` | Enemy stunned (knocked out) | Nintendo (*Super Mario*); sound rip |
| `jump.ogg` | Jump | Nintendo (*Super Mario* / *Wario*); sound rip |
| `groundpound-normal.ogg` | Landing impact | Nintendo (*Wario* / *Mario*); sound rip |
| `walk-bump.ogg` | Bumping into a wall | Nintendo (*Super Mario*); sound rip |
| `pause.ogg` | Entering a door | Nintendo; sound rip |
| `1up.ogg` | Door unlocked | *Super Mario* (Nintendo), 1-Up sound; sound rip |
| `menu-unavaible.ogg` | Door locked | Nintendo; menu/error sound; sound rip |
| `message.ogg` | Selection / text prompt | Nintendo; sound rip |
| `levelfinish.ogg` | Level completed | Nintendo (*Super Mario*); jingle; sound rip |

## Levels / maps

| File | Use | Origin / Source |
|---|---|---|
| `tilemaps/level_1_1.json` … `level_2_2.json`, `tilemaps/stage_select.json` | Level and map data | Own work, created with the Tiled map editor |

## Tools used

- **GIMP** — pixel-art creation and editing (`.xcf` source files)
- **Tiled** — level / tilemap design (`.json` / `.tmx`)
- **Phaser 3** — game engine
