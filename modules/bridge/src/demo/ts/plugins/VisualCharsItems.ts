

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  isDirty: () => true
};

export const registerVisualCharsItems = (): void => {
  getDemoRegistry().addToggleButton('visualchars', {
    type: 'togglebutton',
    enabled: true,
    onSetup: (buttonApi) => {
      editor.on('VisualChars', (e: any) => {
        buttonApi.setActive(e);
      });
      return () => {};
    },
    onAction: (_buttonApi) => {
      // toggles visual chars

    }
  });
};
