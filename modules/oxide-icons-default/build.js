const { iconPackager } = require('@ephox/oxide-icons-tools');
const { rmSync, mkdirSync } = require('fs');
const { promisify } = require('util');
const glob = promisify(require('glob'));

async function clean() {
  await rmSync('./dist', { recursive: true, force: true });
  mkdirSync('./dist', { recursive: true });
}

async function iconPackagerTask() {
  const files = await glob('src/svg/**/*.svg');
  const result = await iconPackager({
    name: 'default',
    files
  });
  result.forEach((file) => {
    const filePath = `./dist/${file.name}`;
    mkdirSync(filePath, { recursive: true });
    fs.writeFileSync(`${filePath}/${file.name}`, file.data);
  });
}

(async function () {
  await clean();
  await iconPackagerTask();
}());
