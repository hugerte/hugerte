import { Arr, Fun, Global, Obj } from '@ephox/katamari';

import { Editor } from '../alien/EditorTypes';
import { get as getOption } from '../alien/Options';

const isSilver = (): boolean => {
  const hugerte = Global.hugerte;
  if (!hugerte) {
    throw new Error('Failed to get global hugerte');
  }
  return Obj.has(hugerte.activeEditor, 'ui');
};

const isModern = (): boolean => !isSilver();

export interface ThemeSelectors {
  toolBarSelector: (editor: Editor) => string;
  menuBarSelector: string;
  dialogSelector: string;
  dialogCancelSelector: string;
  dialogCloseSelector: string;
  dialogSubmitSelector: string;
}

const ModernThemeSelectors: ThemeSelectors = {
  toolBarSelector: Fun.constant('.mce-toolbar-grp'),
  menuBarSelector: '.mce-menubar',
  dialogSelector: '.mce-window',
  dialogCancelSelector: 'div[role="button"]:contains(Cancel)',
  dialogCloseSelector: 'button.mce-close',
  dialogSubmitSelector: 'div[role="button"].mce-primary'
};

const SilverThemeSelectors: ThemeSelectors = {
  toolBarSelector: (editor: Editor) => Arr.exists([ getOption(editor, 'toolbar_mode'), getOption(editor, 'toolbar_drawer') ], (s) => s === 'floating' || s === 'sliding') ? '.tox-toolbar-overlord' : '.tox-toolbar',
  menuBarSelector: '.tox-menubar',
  dialogSelector: 'div[role="dialog"]',
  dialogCancelSelector: '.tox-button:contains("Cancel")',
  dialogCloseSelector: '.tox-button[data-mce-name="close"]',
  dialogSubmitSelector: '.tox-button:contains("Save")'
};

const getThemeSelectors = (): ThemeSelectors => isModern() ? ModernThemeSelectors : SilverThemeSelectors;

export {
  getThemeSelectors,
  isModern,
  isSilver
};
