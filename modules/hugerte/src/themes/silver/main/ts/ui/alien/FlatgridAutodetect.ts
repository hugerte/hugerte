import { AlloyComponent } from '@ephox/alloy';
import { SelectorFilter } from '@ephox/sugar';

const detectSize = (comp: AlloyComponent, margin: number, selectorClass: string): ({ numColumns: number; numRows: number }) | null => {
  const descendants = SelectorFilter.descendants(comp.element, '.' + selectorClass);

  // TODO: This seems to cause performance issues in the emoji dialog
  if (descendants.length > 0) {
    const columnLength = (descendants).findIndex((c) => {
      const thisTop = c.dom.getBoundingClientRect().top;
      const cTop = descendants[0].dom.getBoundingClientRect().top;
      return Math.abs(thisTop - cTop) > margin;

    }) ?? (descendants.length);

    return {
      numColumns: columnLength,
      numRows: Math.ceil(descendants.length / columnLength)
    };
  } else {
    return null;
  }
};

export {
  detectSize
};
