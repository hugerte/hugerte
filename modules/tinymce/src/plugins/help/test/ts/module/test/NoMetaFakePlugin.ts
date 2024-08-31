import { Fun } from '@hugemce/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

export default (): void => {
  PluginManager.add('nometafake', Fun.noop);
};
