import { Fun } from '@hugemce/katamari';

import * as Registry from '../../../main/ts/hugemce/bridge/api/Registry';

const editorButtons = Registry.create();

// This would be exposed as a public api in tinymce as something like editor.ui or similar
const getDemoRegistry = Fun.constant(editorButtons);

export {
  getDemoRegistry
};
