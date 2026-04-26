import { Selectors, SugarElement, Traverse } from '@ephox/sugar';

const firstLayer = <T extends Element>(scope: SugarElement<Node>, selector: string): SugarElement<T>[] => {
  return filterFirstLayer(scope, selector, (() => true as const));
};

const filterFirstLayer = <T extends Element>(scope: SugarElement<Node>, selector: string, predicate: (e: SugarElement<Node & ChildNode>) => boolean): SugarElement<T>[] => {
  return (Traverse.children(scope)).flatMap((x) => {
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
