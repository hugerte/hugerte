import { SugarElement } from '../node/SugarElement';
import * as Class from './Class';

/** @deprecated Use `element.dom.classList.add(...classes)` instead. */
const add = (element: SugarElement<Element>, classes: string[]): void => {
  element.dom.classList.add(...classes);
};

/** @deprecated Use `element.dom.classList.remove(...classes)` instead. */
const remove = (element: SugarElement<Element>, classes: string[]): void => {
  element.dom.classList.remove(...classes);
};

const toggle = (element: SugarElement<Element>, classes: string[]): void => {
  classes.forEach((c) => element.dom.classList.toggle(c));
};

const hasAll = (element: SugarElement<Node>, classes: string[]): boolean =>
  classes.every((c) => Class.has(element, c));

const hasAny = (element: SugarElement<Node>, classes: string[]): boolean =>
  classes.some((c) => Class.has(element, c));

/** @deprecated Use `Array.from(element.dom.classList)` instead. */
const get = (element: SugarElement<Element>): string[] =>
  Array.from(element.dom.classList);

export {
  add,
  remove,
  toggle,
  hasAll,
  hasAny,
  get
};
