

import { SugarElement } from '../node/SugarElement';
import * as PredicateFind from '../search/PredicateFind';
import * as Traverse from '../search/Traverse';
import * as Awareness from './Awareness';

const first = (element: SugarElement<Node>): SugarElement<Node & ChildNode> | null =>
  PredicateFind.descendant(element, Awareness.isCursorPosition);

const last = (element: SugarElement<Node>): SugarElement<Node & ChildNode> | null =>
  descendantRtl(element, Awareness.isCursorPosition);

// Note, sugar probably needs some RTL traversals.
const descendantRtl: {
  <T extends Node = Node>(scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => e is SugarElement<T>): SugarElement<T & ChildNode> | null;
  (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node & ChildNode> | null;
} = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): SugarElement<Node & ChildNode> | null => {
  const descend = (element: SugarElement<Node>): SugarElement<Node & ChildNode> | null => {
    const children = Traverse.children(element);
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      if (predicate(child)) {
        return child;
      }
      const res = descend(child);
      if (res !== null) {
        return res;
      }
    }

    return null;
  };

  return descend(scope);
};

export {
  first,
  last
};
