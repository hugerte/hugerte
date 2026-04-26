
import { SugarElement } from '@ephox/sugar';

// Used for atomic testing where window is not available.
const element: <T>(elem: SugarElement<T>) => SugarElement<T> = (x) => x;

export {
  element
};
