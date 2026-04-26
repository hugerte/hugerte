

import { getDemoRegistry } from '../buttons/DemoRegistry';

const editor = {
  on: (_s: string, _f: Function) => { },
  off: (_s: string, _f: Function) => { },
  isDirty: () => true
};

export const registerTocItems = (): void => {
  getDemoRegistry().addButton('toc', {
    type: 'button',
    enabled: true,
    onSetup: (buttonApi) => {
      editor.on('LoadContent SetContent change', (e: any) => {
        buttonApi.setEnabled(!e);
      });
      return () => {};
    },
    onAction: (_buttonApi) => {
      // insert Table of contents
    }
  });
};
