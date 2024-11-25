import * as PlatformDetection from "hugerte/sand/api/PlatformDetection";

const platform = PlatformDetection.detect();

const ephoxUi = document.querySelector('#ephox-ui') as HTMLElement;
ephoxUi.innerHTML = 'You are using: ' + platform.browser.current;
