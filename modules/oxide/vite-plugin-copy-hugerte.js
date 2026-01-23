import fs from 'node:fs';
import path from 'node:path';

export default function copyHugerte() {
  return {
    name: 'vite-plugin-copy-hugerte',
    buildStart() {
      const hugertePath = '../hugerte/js/hugerte/hugerte.min.js';
      const buildPath = './build';

      if (fs.existsSync(hugertePath)) {
        fs.copyFileSync(hugertePath, path.join(buildPath, 'hugerte.min.js'));
      } else {
        console.log('🚨 Local HugeRTE does not exist. Using CDN version instead');
        console.log('⚠️ Run yarn build in the repository root to build a local version of HugeRTE');
        const url = 'https://cdn.jsdelivr.net/npm/hugerte@1/hugerte.min.js';
        const html = fs.readFileSync(path.join(buildPath, 'index.html'), 'utf8');
        fs.writeFileSync(path.join(buildPath, 'index.html'), html.replace('/hugerte/hugerte.min.js', url));
      }
    },
  };
}
