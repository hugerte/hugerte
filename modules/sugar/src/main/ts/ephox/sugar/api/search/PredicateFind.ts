

import ClosestOrAncestor from '../../impl/ClosestOrAncestor';
import * as Compare from '../dom/Compare';
import * as SugarBody from '../node/SugarBody';
import { SugarElement } from '../node/SugarElement';

const first: {
  <T extends Node = Node> (predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T & ChildNode> | null;
  (predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node & ChildNode> | null;
} = (predicate: (e: SugarElement<Node>) => boolean) =>
  descendant(SugarBody.body(), predicate);

const ancestor: {
  <T extends Node = Node> (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<T> | null;
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<Node> | null;
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean) => {
  let element = scope.dom;
  const stop = typeof isRoot === 'function' ? isRoot : () => false;

  while (element.parentNode) {
    element = element.parentNode;
    const el = SugarElement.fromDom(element);

    if (predicate(el)) {
      return el;
    } else if (stop(el)) {
      break;
    }
  }
  return null;
};

const closest: {
  <T extends Node = Node> (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<T> | null;
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean): SugarElement<Node> | null;
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean) => {
  // This is required to avoid ClosestOrAncestor passing the predicate to itself
  const is = (s: SugarElement<Node>, test: (e: SugarElement<Node>) => boolean): s is SugarElement<Node> => test(s);
  return ClosestOrAncestor(is, ancestor, scope, predicate, isRoot);
};

const sibling: {
  <T extends Node = Node> (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T & ChildNode> | null;
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node & ChildNode> | null;
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node & ChildNode> | null => {
  const element = scope.dom;
  if (!element.parentNode) {
    return null;
  }

  return child(SugarElement.fromDom(element.parentNode), (x) => !Compare.eq(scope, x) && predicate(x));
};

const child: {
  <T extends Node = Node> (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T & ChildNode> | null;
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node & ChildNode> | null;
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean) => {
  const pred = (node: Node) => predicate(SugarElement.fromDom(node));
  const result = (scope.dom.childNodes.find(pred) ?? null);
  return result.map(SugarElement.fromDom);
};

const descendant: {
  <T extends Node = Node> (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T & ChildNode> | null;
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node & ChildNode> | null;
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean) => {
  const descend = (node: Node): SugarElement<Node & ChildNode> | null => {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = SugarElement.fromDom(node.childNodes[i]);
      if (predicate(child)) {
        return child;
      }

      const res = descend(node.childNodes[i]);
      if (res !== null) {
        return res;
      }
    }

    return null;
  };

  return descend(scope.dom);
};

export { first, ancestor, closest, sibling, child, descendant };
