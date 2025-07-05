import { SugarElement } from '../node/SugarElement';
import * as InsertAll from './InsertAll';

const empty = (element: SugarElement<Node>): void => {
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
const remove = (element: SugarElement<Node>): void => {
  const dom = element.dom;
  if (dom.parentNode !== null) {
    dom.parentNode.removeChild(dom);
  }
};

const unwrap = (wrapper: SugarElement<Node>): void => {
  const children = [].slice.call(wrapper.dom.childNodes).map(SugarElement.fromDom);
  if (children.length > 0) {
    InsertAll.after(wrapper, children);
  }
  remove(wrapper);
};

export {
  empty,
  remove,
  unwrap
};
