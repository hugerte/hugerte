

import { SugarElement } from '../api/node/SugarElement';

type TestFn = (e: SugarElement<Node>) => boolean;
type ScopeTestFn<T, R extends Node> = (scope: SugarElement<Node>, a: T) => scope is SugarElement<R>;
type AncestorFn<T, R extends Node> = (scope: SugarElement<Node>, predicate: T, isRoot?: TestFn) => SugarElement<R> | null;

export default <T, R extends Node = Node> (is: ScopeTestFn<T, R>, ancestor: AncestorFn<T, R>, scope: SugarElement<Node>, a: T, isRoot?: TestFn): SugarElement<R> | null => {
  if (is(scope, a)) {
    return scope;
  } else if (typeof isRoot === 'function' && isRoot(scope)) {
    return null;
  } else {
    return ancestor(scope, a, isRoot);
  }
};
