import { SugarElement } from '../node/SugarElement';
import * as PredicateFind from './PredicateFind';

const any = (predicate: (e: SugarElement<Node>) => boolean): boolean =>
  PredicateFind.first(predicate) !== null;

const ancestor = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean): boolean =>
  PredicateFind.ancestor(scope, predicate, isRoot) !== null;

const closest = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean, isRoot?: (e: SugarElement<Node>) => boolean): boolean =>
  PredicateFind.closest(scope, predicate, isRoot) !== null;

const sibling = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): boolean =>
  PredicateFind.sibling(scope, predicate) !== null;

const child = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): boolean =>
  PredicateFind.child(scope, predicate) !== null;

const descendant = (scope: SugarElement<Node>, predicate: (e: SugarElement<Node>) => boolean): boolean =>
  PredicateFind.descendant(scope, predicate) !== null;

export {
  any,
  ancestor,
  closest,
  sibling,
  child,
  descendant
};
