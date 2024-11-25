import { Arr, Fun } from "@hugerte/katamari";
import { Selectors, SugarElement, Traverse } from "@hugerte/sugar";

const firstLayer = <T extends Element>(scope: SugarElement<Node>, selector: string): SugarElement<T>[] => {
  return filterFirstLayer(scope, selector, Fun.always);
};

const filterFirstLayer = <T extends Element>(scope: SugarElement<Node>, selector: string, predicate: (e: SugarElement<Node & ChildNode>) => boolean): SugarElement<T>[] => {
  return Arr.bind(Traverse.children(scope), (x) => {
    if (Selectors.is<T>(x, selector)) {
      return predicate(x) ? [ x ] : [];
    } else {
      return filterFirstLayer(x, selector, predicate);
    }
  });
};

export {
  firstLayer,
  filterFirstLayer
};
