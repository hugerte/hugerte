import * as PlatformDetection from 'ephox/sand/api/PlatformDetection'; // TODO bun works, vscode not

const platform = PlatformDetection.detect();

const div = document.createElement('div');
div.innerHTML = 'You are using: ' + platform.browser.current;
document.body.appendChild(div);
