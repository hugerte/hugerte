import { SugarElement } from '../node/SugarElement';
import * as InsertAll from './InsertAll';

/** @deprecated Set innerHTML to '' instead */
const empty = (element: SugarElement<Element>): void => {
  // shortcut "empty node" trick.
  element.dom.textContent = '';

  // If the contents was a single empty text node, the above doesn't remove it. But, it's still faster in general
  // than removing every child node manually.
  // The following is (probably) safe for performance as 99.9% of the time the trick works and
  // element.dom.childNodes will be empty.
  element.dom.childNodes.forEach((node) => {
    node.remove();
  });
};

/** @deprecated Use `element.dom.remove()` instead. */
const remove = (element: SugarElement<Element>): void => {
  element.dom.remove();
};

const unwrap = (wrapper: SugarElement<Element>): void => {
  const children = [].slice.call(wrapper.dom.childNodes).map(SugarElement.fromDom);
  if (children.length > 0) {
    InsertAll.after(wrapper, children);
  }
  wrapper.dom.remove();
};

export {
  empty,
  remove,
  unwrap
};
