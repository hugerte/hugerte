import fs from 'node:fs';
import path from 'node:path';

export default function buildSkinSwitcher() {
  return {
    name: 'vite-plugin-build-skin-switcher',
    buildEnd() {
      const getDirs = (p) => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
      const uiSkins = getDirs(`./build/skins/ui`);
      const contentSkins = getDirs(`./build/skins/content`);
      const data = `uiSkins = ${JSON.stringify(uiSkins)}, contentSkins = ${JSON.stringify(contentSkins)}`;
      const html = fs.readFileSync('./build/index.html', 'utf8');
      fs.writeFileSync('./build/index.html', html.replace('/** ADD_DATA */', data));
    },
  };
}
