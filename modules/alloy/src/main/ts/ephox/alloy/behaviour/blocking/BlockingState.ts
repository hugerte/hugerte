import { Singleton } from "@hugerte/katamari";

import { nuState } from '../common/BehaviourState';
import { BlockingState } from './BlockingTypes';

export const init = (): BlockingState => {
  const blocker = Singleton.destroyable();

  const blockWith = (destroy: () => void) => {
    blocker.set({ destroy });
  };

  return nuState({
    readState: blocker.isSet,
    blockWith,
    clear: blocker.clear,
    isBlocked: blocker.isSet
  });
};
