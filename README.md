# Immortal Morten

A 2D platformer built with [Phaser 3](https://phaser.io/).

**Play in the browser:** https://frenibo.github.io/Immortal_Morten/

> **Non-commercial fan project.** Immortal Morten is a free, unofficial student
> project. It is not affiliated with, endorsed by or sponsored by Nintendo, Capcom,
> Rare, Sunsoft or any other company. Many sprites, sound effects and all music
> tracks are taken or adapted from commercial games and are **not ours**.
> See the [Disclaimer](#disclaimer) below.

## Getting started

```bash
npm install
npm run dev       # starts Vite dev server at http://localhost:8080
npm run build     # produces a production bundle in /dist
```

> **Fallback (no build tool):** a pre-bundled `phaser.js` sits in the repo root.
> Edit `index.html` to swap back to `<script src="./phaser.js">` if you need it.

## Controls

| Key | Action |
|-----|--------|
| ← / A | Move left |
| → / D | Move right |
| ↑ / W | Jump |
| ↓ / S | Enter door |
| C | Toggle sound (overlay) |
| X | Leave the current stage (overlay) |

The overlay buttons (sound, exit) can also be clicked with the mouse.

## Disclaimer

Immortal Morten is an unofficial, non-commercial fan project made as a student
project. It is not affiliated with, endorsed by or sponsored by any of the
companies or rights holders named below.

- **Assets that are not ours.** The player and enemy sprites, the key graphic,
  all sound effects and all music tracks are taken from, or adapted from,
  commercial video games. They remain the property of their respective owners,
  including Nintendo (*Wario Land*, *Super Mario*), Rare (*Battletoads*),
  Capcom (*Vampire Savior*, *DuckTales 2*) and Sunsoft (*Batman: The Video Game*).
  *DuckTales* is a trademark of Disney, *Batman* a trademark of DC Comics. All
  other names and trademarks belong to their respective owners.
- **No infringement intended.** These assets are used for educational,
  non-profit purposes only. No ownership of them is claimed, and no copyright or
  trademark infringement is intended.
- **Non-commercial.** The game is free to play. It is not sold, shows no ads,
  accepts no donations, and nobody earns money from it.
- **Removal on request.** If you hold the rights to any of this material and want
  it removed, please [open an issue](https://github.com/frenibo/Immortal_Morten/issues)
  and it will be taken down promptly.

Our own work is the source code, the level design and the door and time-bonus
graphics. The tilesets are mostly from [*Pixel Adventure*](https://pixelfrog-assets.itch.io/pixel-adventure-1)
by Pixel Frog (CC0), and the title screen image was generated with ChatGPT.
Per-file credits are listed in [ASSETS.md](ASSETS.md).