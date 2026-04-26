

import PluginManager from 'hugerte/core/api/PluginManager';

export default (): void => {
  PluginManager.add('nometafake', () => {});
};
