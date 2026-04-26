import { Cell } from '@ephox/katamari';

import { nuState } from '../common/BehaviourState';
import { SlidingConfig, SlidingState } from './SlidingTypes';

const init = (spec: SlidingConfig): SlidingState => {
  const state = Cell(spec.expanded);

  const readState = () => 'expanded: ' + state.get();

  return nuState({
    isExpanded: () => state.get() === true,
    isCollapsed: () => state.get() === false,
    setCollapsed: ((..._rest: any[]) => (state.set)(false, ..._rest)),
    setExpanded: ((..._rest: any[]) => (state.set)(true, ..._rest)),
    readState
  });
};

export {
  init
};
