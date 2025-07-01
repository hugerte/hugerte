import { SugarElement } from '../node/SugarElement';

/** @deprecated Use `element.dom.classList.add(clazz)` instead. */
const add = (element: SugarElement<Element>, clazz: string): void => {
  element.dom.classList.add(clazz);
};

/** @deprecated Use `element.dom.classList.remove(clazz)` instead. */
const remove = (element: SugarElement<Element>, clazz: string): void => {
  element.dom.classList.remove(clazz);
};

/** @deprecated Use `element.dom.classList.toggle(clazz)` instead. */
const toggle = (element: SugarElement<Element>, clazz: string): boolean => {
  return element.dom.classList.toggle(clazz);
};

const has = (element: SugarElement<Node>, clazz: string): boolean =>
  element.dom instanceof Element && element.dom.classList.contains(clazz);

export {
  add,
  remove,
  toggle,
  has
};
