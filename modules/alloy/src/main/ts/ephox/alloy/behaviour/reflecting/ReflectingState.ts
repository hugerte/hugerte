import { Cell } from '@ephox/katamari';

import { ReflectingState } from './ReflectingTypes';

const init = <S>(): ReflectingState<S> => {
  const cell = Cell(null);

  const clear = () => cell.set(null);

  const readState = (): any => cell.get() ?? ('none');

  return {
    readState,
    get: cell.get,
    set: cell.set,
    clear
  };
};

export {
  init
};
