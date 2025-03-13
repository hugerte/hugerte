import { defineConfig } from 'vite';
import stylelint from 'vite-plugin-stylelint';
import copyHugeRTE from './vite-plugin-copy-hugerte';
import buildSkinSwitcher from './vite-plugin-build-skin-switcher';
import path from 'path';

export default defineConfig({
  root: './src',
  build: {
    outDir: './build',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/demo/index.html'),
      },
      external: ['/hugerte/hugerte.min.js'],
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  plugins: [
    stylelint({
      fix: true,
      configFile: '.stylelintrc',
    }),
    copyHugeRTE(),
    buildSkinSwitcher(),
  ],
});
