
import { Dialog } from 'hugerte/core/api/ui/Ui';

import { CustomTabSpecs } from '../Plugin';

export interface Api {
  readonly addTab: (spec: Dialog.TabSpec) => void;
}

const get = (customTabs: CustomTabSpecs): Api => {
  const addTab = (spec: Dialog.TabSpec): void => {
    const name = spec.name ?? (('tab-name') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
    const currentCustomTabs = customTabs.get();
    currentCustomTabs[name] = spec;
    customTabs.set(currentCustomTabs);
  };

  return {
    addTab
  };
};

export { get };
