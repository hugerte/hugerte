import PluginManager from 'hugerte/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Buttons from './ui/Buttons';
import * as Options from './api/Options';

export default (): void => {
  PluginManager.add('preview', (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Buttons.register(editor);
  });
};
