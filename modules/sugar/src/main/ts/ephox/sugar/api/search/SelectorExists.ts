import { SugarElement } from '../node/SugarElement';
import * as SelectorFind from './SelectorFind';

const any = (selector: string): boolean =>
  SelectorFind.first(selector) !== null;

const ancestor = (scope: SugarElement<Node>, selector: string, isRoot?: (e: SugarElement<Node>) => boolean): boolean =>
  SelectorFind.ancestor(scope, selector, isRoot) !== null;

const sibling = (scope: SugarElement<Node>, selector: string): boolean =>
  SelectorFind.sibling(scope, selector) !== null;

const child = (scope: SugarElement<Node>, selector: string): boolean =>
  SelectorFind.child(scope, selector) !== null;

const descendant = (scope: SugarElement<Node>, selector: string): boolean =>
  SelectorFind.descendant(scope, selector) !== null;

const closest = (scope: SugarElement<Node>, selector: string, isRoot?: (e: SugarElement<Node>) => boolean): boolean =>
  SelectorFind.closest(scope, selector, isRoot) !== null;

export {
  any,
  ancestor,
  sibling,
  child,
  descendant,
  closest
};
