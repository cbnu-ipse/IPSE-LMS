// Builds the [untitled] room scene as one ES module into static/game/untitled3d/untitled3d.js (models already live next to it).
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    outDir: path.resolve(import.meta.dirname, '../../static/game/untitled3d'),
    emptyOutDir: false,
    lib: { entry: path.resolve(import.meta.dirname, 'src/main.js'), formats: ['es'], fileName: () => 'untitled3d.js' },
    target: 'es2020',
    minify: true,
  },
});
