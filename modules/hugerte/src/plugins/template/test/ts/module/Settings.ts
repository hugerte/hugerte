
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';

interface Settings {
  readonly addSettings: (config: Record<string, any>) => void;
  readonly cleanupSettings: () => void;
}

const Settings = (hook: TinyHooks.Hook<Editor>): Settings => {
  let settings = new Set<string>();

  const addSettings = (config: Record<string, any>) => {
    const editor = hook.editor();
    Object.entries(config).forEach(([k, v]) => ((val, key) =>(v, k)) {
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
