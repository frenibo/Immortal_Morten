import { defineConfig } from 'vite';
import { cpSync } from 'node:fs';

// Phaser loads assets by URL string at runtime, so Vite never bundles them.
// Copy the assets folder into the build output so the built game can find them.
const copyAssets = () => ({
    name: 'copy-assets',
    apply: 'build',
    closeBundle() {
        cpSync('assets', 'dist/assets', { recursive: true });
    },
});

export default defineConfig({
    // Use './' so asset paths work when the build is opened directly from the filesystem
    // or served from a sub-path such as GitHub Pages (/MI2-Phaser-Game/).
    base: './',
    plugins: [copyAssets()],
    server: {
        port: 8080,
        open: true,
    },
    build: {
        outDir: 'dist',
    },
});
