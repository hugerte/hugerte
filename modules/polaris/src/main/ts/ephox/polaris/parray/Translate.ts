

import { PRange } from '../pattern/Types';

/** Adjust a PositionArray positions by an offset */
const translate = <T extends PRange>(parray: T[], offset: number): T[] => {
  return parray.map((unit) => {
    return {
      ...unit,
      start: unit.start + offset,
      finish: unit.finish + offset
    };
  });
};

export {
  translate
};
