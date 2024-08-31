import { Fun } from '@hugemce/katamari';
import { SugarElement } from '@hugemce/sugar';

// Used for atomic testing where window is not available.
const element: <T>(elem: SugarElement<T>) => SugarElement<T> = Fun.identity;

export {
  element
};
