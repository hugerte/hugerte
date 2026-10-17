import { Type } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';
import { EditorOptions } from 'hugerte/core/api/OptionTypes';
import { Dialog } from 'hugerte/core/api/ui/Ui';

export type HelpTabsSetting = (string | Dialog.TabSpec)[];

const option: {
  <K extends keyof EditorOptions>(name: K): (editor: Editor) => EditorOptions[K];
  <T>(name: string): (editor: Editor) => T;
} = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption('help_shortcut', {
    // Reject anything that could be rendered as HTML in the help dialog or is not a shortcut/false.
    processor: (value) => value === false || (Type.isString(value) && !/[<>&"']/.test(value)),
    default: 'Alt+0'
  });

  registerOption('help_tabs', {
    processor: 'array'
  });
};

const getHelpShortcut = option<string | false>('help_shortcut');
const getHelpTabs = option<HelpTabsSetting | undefined>('help_tabs');
const getForcedPlugins = option('forced_plugins');

export {
  register,
  getHelpTabs,
  getHelpShortcut,
  getForcedPlugins
};
