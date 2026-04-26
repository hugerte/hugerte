
import { PlacerResult } from '../../positioning/layout/LayoutTypes';
import { nuState } from '../common/BehaviourState';
import { PositioningState } from './PositioningTypes';

export const init = (): PositioningState => {
  let state: Record<string, PlacerResult> = {};

  const set = (id: string, data: PlacerResult) => {
    state[id] = data;
  };

  const get = (id: string): (PlacerResult) | null =>
    ((state)[id] ?? null);

  const clear = (id?: string) => {
    if ((id) != null) {
      delete state[id];
    } else {
      state = {};
    }
  };

  return nuState({
    readState: () => state,
    clear,
    set,
    get
  });
};
