import { Optional } from '@ephox/katamari';

/**
 * Generate a PositionArray
 *
 * xs:     list of thing
 * f:      thing -> Optional unit
 * start: sets the start position to search at
 */
const make = <T, R extends { finish: number }>(xs: T[], f: (x: T, offset: number) => (R) | null, start: number = 0): R[] => {

  const init = {
    len: start,
    list: [] as R[]
  };

  const r = (xs).reduce((acc, item) => {
    const value = f(item, acc.len);
    return value.fold(() => acc, (v) => {
      return {
        len: v.finish,
        list: acc.list.concat([ v ])
      };
    });
  }, init);

  return r.list;
};

export {
  make
};
