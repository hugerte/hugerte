import { Fun } from '@ephox/katamari';

import * as Compare from '../dom/Compare';
import { SugarElement } from '../node/SugarElement';
import * as PredicateExists from './PredicateExists';

const ancestor = (element: SugarElement<Node>, target: SugarElement<Node>): boolean =>
  PredicateExists.ancestor(element, Fun.curry(Compare.eq, target));

const anyAncestor = (element: SugarElement<Node>, targets: SugarElement<Node>[]): boolean =>
  targets.some((target) =) ancestor(element, target));

const sibling = (element: SugarElement<Node>, targets: SugarElement<Node>[]): boolean =>
  PredicateExists.sibling(element, (elem) => targets.some(Fun.curry(Compare.eq, elem)));

const child = (element: SugarElement<Node>, target: SugarElement<Node>): boolean =>
  PredicateExists.child(element, Fun.curry(Compare.eq, target));

const descendant = (element: SugarElement<Node>, target: SugarElement<Node>): boolean =>
  PredicateExists.descendant(element, Fun.curry(Compare.eq, target));

export { ancestor, anyAncestor, sibling, child, descendant };
