import { Fun } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

// Used for atomic testing where window is not available.
const element: <T>(elem: SugarElement<T>) => SugarElement<T> = Fun.identity;

export {
  element
};
