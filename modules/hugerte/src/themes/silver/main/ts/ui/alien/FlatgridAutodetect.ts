import { AlloyComponent } from "@hugerte/alloy";
import { Arr, Optional } from "@hugerte/katamari";
import { SelectorFilter } from "@hugerte/sugar";

const detectSize = (comp: AlloyComponent, margin: number, selectorClass: string): Optional<{ numColumns: number; numRows: number }> => {
  const descendants = SelectorFilter.descendants(comp.element, '.' + selectorClass);

  // TODO: This seems to cause performance issues in the emoji dialog
  if (descendants.length > 0) {
    const columnLength = Arr.findIndex(descendants, (c) => {
      const thisTop = c.dom.getBoundingClientRect().top;
      const cTop = descendants[0].dom.getBoundingClientRect().top;
      return Math.abs(thisTop - cTop) > margin;

    }).getOr(descendants.length);

    return Optional.some({
      numColumns: columnLength,
      numRows: Math.ceil(descendants.length / columnLength)
    });
  } else {
    return Optional.none();
  }
};

export {
  detectSize
};
