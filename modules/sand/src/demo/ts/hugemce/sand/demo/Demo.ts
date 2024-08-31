import * as PlatformDetection from 'hugemce/sand/api/PlatformDetection';

const platform = PlatformDetection.detect();

const hugemceUi = document.querySelector('#hugemce-ui') as HTMLElement;
hugemceUi.innerHTML = 'You are using: ' + platform.browser.current;
