import { Fun } from "@hugerte/katamari";

import PluginManager from 'hugerte/core/api/PluginManager';

export default (): void => {
  PluginManager.add('nometafake', Fun.noop);
};
