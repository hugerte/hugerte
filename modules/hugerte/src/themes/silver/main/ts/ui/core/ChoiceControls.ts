import { Singleton } from '@ephox/katamari';
import { Attribute, Dimension, SugarElement, SugarNode, TransformFind } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';
import { ContentLanguage } from 'hugerte/core/api/OptionTypes';
import { Menu, Toolbar } from 'hugerte/core/api/ui/Ui';

import * as Options from '../../api/Options';
import { composeUnbinders, onSetupEditableToggle } from './ControlUtils';

interface ControlSpec<T> {
  readonly name: string;
  readonly text: string;
  readonly icon: string;

  readonly getOptions: (editor: Editor) => Array<T>;
  // Turn it into a normalised lookup key
  readonly hash: (item: T) => string;
  readonly display: (item: T) => string;

  readonly watcher: (editor: Editor, item: T, callback: (isActive: boolean) => void) => () => void;
  readonly getCurrent: (editor: Editor) => (T) | null;
  readonly setCurrent: (editor: Editor, value: T) => void;

  readonly onToolbarSetup?: (api: Toolbar.ToolbarMenuButtonInstanceApi) => () => void;
  readonly onMenuSetup?: (api: Menu.NestedMenuItemInstanceApi) => () => void;
}

const registerController = <T>(editor: Editor, spec: ControlSpec<T>) => {
  const getMenuItems = (): Menu.ToggleMenuItemSpec[] => {
    const options = spec.getOptions(editor);
    const initial = spec.getCurrent(editor).map(spec.hash);

    const current = Singleton.value<Menu.ToggleMenuItemInstanceApi>();

    return (options).map((value) => ({
      type: 'togglemenuitem',
      text: spec.display(value),
      onSetup: (api) => {
        const setActive = (active: boolean) => {
          if (active) {
            current.on((oldApi) => oldApi.setActive(false));
            current.set(api);
          }
          api.setActive(active);
        };

        setActive((initial !== null && (initial) === (spec.hash(value))));
        const unbindWatcher = spec.watcher(editor, value, setActive);
        return () => {
          current.clear();
          unbindWatcher();
        };
      },
      onAction: () => spec.setCurrent(editor, value)
    }));
  };

  editor.ui.registry.addMenuButton(spec.name, {
    tooltip: spec.text,
    icon: spec.icon,
    fetch: (callback) => callback(getMenuItems()),
    onSetup: spec.onToolbarSetup
  });

  editor.ui.registry.addNestedMenuItem(spec.name, {
    type: 'nestedmenuitem',
    text: spec.text,
    getSubmenuItems: getMenuItems,
    onSetup: spec.onMenuSetup
  });
};

const lineHeightSpec = (editor: Editor): ControlSpec<string> => ({
  name: 'lineheight',
  text: 'Line height',
  icon: 'line-height',

  getOptions: Options.getLineHeightFormats,
  hash: (input) => Dimension.normalise(input, [ 'fixed', 'relative', 'empty' ]) ?? (input),
  display: (x: any) => x,

  watcher: (editor, value, callback) =>
    editor.formatter.formatChanged('lineheight', callback, false, { value }).unbind,
  getCurrent: (editor) => (editor.queryCommandValue('LineHeight') ?? null),
  setCurrent: (editor, value) => editor.execCommand('LineHeight', false, value),
  onToolbarSetup: onSetupEditableToggle(editor),
  onMenuSetup: onSetupEditableToggle(editor)
});

const languageSpec = (editor: Editor): (ControlSpec<ContentLanguage>) | null => {
  const settingsOpt = (Options.getContentLanguages(editor) ?? null);
  return settingsOpt.map((settings) => ({
    name: 'language',
    text: 'Language',
    icon: 'language',

    getOptions: () => settings,
    hash: (input) => (input.customCode) === undefined ? input.code : `${input.code}/${input.customCode}`,
    display: (input) => input.title,

    watcher: (editor, value, callback) =>
      editor.formatter.formatChanged('lang', callback, false, { value: value.code, customValue: value.customCode ?? null }).unbind,
    getCurrent: (editor) => {
      const node = SugarElement.fromDom(editor.selection.getNode());
      return TransformFind.closest(node, (n) =>
        n
          .filter(SugarNode.isElement)
          .bind((ele) => {
            const codeOpt = Attribute.getOpt(ele, 'lang');
            return codeOpt.map((code): ContentLanguage => {
              const customCode = Attribute.getOpt(ele, 'data-mce-lang') ?? undefined;
              return { code, customCode, title: '' };
            });
          })
      );
    },
    setCurrent: (editor, lang) => editor.execCommand('Lang', false, lang),

    onToolbarSetup: (api) => {
      const unbinder = Singleton.unbindable();
      api.setActive(editor.formatter.match('lang', {}, undefined, true));
      unbinder.set(editor.formatter.formatChanged('lang', api.setActive, true));
      return composeUnbinders(unbinder.clear, onSetupEditableToggle(editor)(api));
    },
    onMenuSetup: onSetupEditableToggle(editor)
  }));
};

const register = (editor: Editor): void => {
  registerController(editor, lineHeightSpec(editor));
  languageSpec(editor).each((spec) => registerController(editor, spec));
};

export {
  register
};
