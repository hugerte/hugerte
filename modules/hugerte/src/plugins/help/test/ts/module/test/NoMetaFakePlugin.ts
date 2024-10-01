import { Fun } from '@ephox/katamari';

import PluginManager from 'hugerte/core/api/PluginManager';

export default (): void => {
  PluginManager.add('nometafake', Fun.noop);
};
