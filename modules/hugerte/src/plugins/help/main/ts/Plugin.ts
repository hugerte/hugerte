import { Cell } from '@ephox/katamari';

import PluginManager from 'hugerte/core/api/PluginManager';
import { Dialog as DialogType } from 'hugerte/core/api/ui/Ui';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Buttons from './ui/Buttons';
import * as Dialog from './ui/Dialog';
import * as KeyboardNavTabI18n from './ui/KeyboardNavTabI18n';

export type TabSpecs = Record<string, DialogType.TabSpec>;
export type CustomTabSpecs = Cell<TabSpecs>;

export default (): void => {
  PluginManager.add('help', (editor, pluginUrl) => {
    const customTabs: CustomTabSpecs = Cell({});
    const api = Api.get(customTabs);

    Options.register(editor);
    const dialogOpener = Dialog.init(editor, customTabs, pluginUrl);
    Commands.register(editor, dialogOpener);
    const shortcut = Options.getHelpShortcut(editor);
    if (shortcut) {
      editor.shortcuts.add(shortcut, 'Open help dialog', 'mceHelp');
    }
    Buttons.register(editor, dialogOpener);
    KeyboardNavTabI18n.initI18nLoad(editor, pluginUrl);

    return api;
  });
};
