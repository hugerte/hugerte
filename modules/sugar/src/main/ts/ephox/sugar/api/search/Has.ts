

import * as Compare from '../dom/Compare';
import { SugarElement } from '../node/SugarElement';
import * as PredicateExists from './PredicateExists';

const ancestor = (element: SugarElement<Node>, target: SugarElement<Node>): boolean =>
  PredicateExists.ancestor(element, (...__rest: any[]) => (Compare.eq)(target, ...__rest));

const anyAncestor = (element: SugarElement<Node>, targets: SugarElement<Node>[]): boolean =>
  targets.some((target) => ancestor(element, target));

const sibling = (element: SugarElement<Node>, targets: SugarElement<Node>[]): boolean =>
  PredicateExists.sibling(element, (elem) => targets.some((...__rest: any[]) => (Compare.eq)(elem, ...__rest)));

const child = (element: SugarElement<Node>, target: SugarElement<Node>): boolean =>
  PredicateExists.child(element, (...__rest: any[]) => (Compare.eq)(target, ...__rest));

const descendant = (element: SugarElement<Node>, target: SugarElement<Node>): boolean =>
  PredicateExists.descendant(element, (...__rest: any[]) => (Compare.eq)(target, ...__rest));

export { ancestor, anyAncestor, sibling, child, descendant };
