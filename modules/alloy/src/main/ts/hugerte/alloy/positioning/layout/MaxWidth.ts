import { Fun } from "@hugerte/katamari";
import { SugarElement, Width } from "@hugerte/sugar";

// applies the max-width as determined by Bounder
const expandable = Fun.constant((element: SugarElement<HTMLElement>, available: number): void => {
  Width.setMax(element, Math.floor(available));
});

export { expandable };
