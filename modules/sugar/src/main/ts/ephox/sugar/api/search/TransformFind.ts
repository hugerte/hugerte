

import { SugarElement } from '../node/SugarElement';

const ensureIsRoot = (isRoot?: (e: SugarElement<Node>) => boolean) => typeof isRoot === 'function' ? isRoot : () => false;

const ancestor = <A> (scope: SugarElement<Node>, transform: (e: SugarElement<Node>) => A | null, isRoot?: (e: SugarElement<Node>) => boolean): A | null => {
  let element = scope.dom;
  const stop = ensureIsRoot(isRoot);

  while (element.parentNode) {
    element = element.parentNode;
    const el = SugarElement.fromDom(element);

    const transformed = transform(el);
    if (transformed !== null) {
      return transformed;
    } else if (stop(el)) {
      break;
    }
  }
  return null;
};

const closest = <A> (scope: SugarElement<Node>, transform: (e: SugarElement<Node>) => A | null, isRoot?: (e: SugarElement<Node>) => boolean): A | null => {
  const current = transform(scope);
  const stop = ensureIsRoot(isRoot);
  return current.orThunk(() => stop(scope) ? null : ancestor(scope, transform, stop));
};

export { ancestor, closest };
