import { Obj } from "@hugerte/katamari";
import { TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

interface Settings {
  readonly addSettings: (config: Record<string, any>) => void;
  readonly cleanupSettings: () => void;
}

const Settings = (hook: TinyHooks.Hook<Editor>): Settings => {
  let settings = new Set<string>();

  const addSettings = (config: Record<string, any>) => {
    const editor = hook.editor();
    Obj.each(config, (val, key) => {
      editor.options.set(key, val);
      settings.add(key);
    });
  };

  const cleanupSettings = () => {
    const editor = hook.editor();
    settings.forEach((key) => editor.options.unset(key));
    settings = new Set<string>();
  };

  return { addSettings, cleanupSettings };
};

export { Settings };
