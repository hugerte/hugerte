import { EventArgs } from '@ephox/sugar';

import { nuState } from '../../behaviour/common/BehaviourState';
import { BaseDraggingState, DragModeDeltas, DragStartData } from './DraggingTypes';

// NOTE: mode refers to the way that information is retrieved from
// the user interaction. It can be things like MouseData, TouchData etc.
const init = <T>(): BaseDraggingState<T> => {
  // Dragging operates on the difference between the previous user
  // interaction and the next user interaction. Therefore, we store
  // the previous interaction so that we can compare it.
  let previous = null;
  // Dragging requires calculating the bounds, so we store that data initially
  // to reduce the amount of computation each mouse movement
  let startData = null;

  const reset = (): void => {
    previous = null;
    startData = null;
  };

  // Return position delta between previous position and nu position,
  // or None if this is the first. Set the previous position to nu.
  const calculateDelta = <E extends Event>(mode: DragModeDeltas<E, T>, nu: T): (T) | null => {
    const result = previous.map((old) => mode.getDelta(old, nu));

    previous = nu;
    return result;
  };

  // NOTE: This dragEvent is the DOM touch event or mouse event
  const update = <E extends Event>(mode: DragModeDeltas<E, T>, dragEvent: EventArgs<E>): (T) | null =>
    mode.getData(dragEvent).bind((nuData) => calculateDelta(mode, nuData));

  const setStartData = (data: DragStartData) => {
    startData = data;
  };

  const getStartData = (): (DragStartData) | null => startData;

  const readState = () => ({ });

  return nuState({
    readState,
    reset,
    update,
    getStartData,
    setStartData
  });
};

export {
  init
};
