import { SugarElement } from '../node/SugarElement';

// TODO: maybe we shouldn't even deprecate these as they can be easy shortcuts
// for all that parentNode and nextSibling stuff. But they shouldn't need SugarElement then.

/** @deprecated Use `marker.dom.parentNode?.insertBefore(element.dom, marker.dom)` instead. */
const before = (marker: SugarElement<Node>, element: SugarElement<Node>): void => {
  marker.dom.parentNode?.insertBefore(element.dom, marker.dom);
};

/** @deprecated Use `marker.dom.parentNode?.insertBefore(element.dom, marker.dom.nextSibling)` instead. */
const after = (marker: SugarElement<Node>, element: SugarElement<Node>): void => {
  marker.dom.parentNode?.insertBefore(element.dom, marker.dom.nextSibling);
};

/** @deprecated Use `parent.dom.insertBefore(element.dom, parent.dom.firstChild)` instead. */
const prepend = (parent: SugarElement<Node>, element: SugarElement<Node>): void => {
  parent.dom.insertBefore(element.dom, parent.dom.firstChild);
};

/** @deprecated Use `parent.dom.appendChild(element.dom)` instead. */
const append = (parent: SugarElement<Node>, element: SugarElement<Node>): void => {
  parent.dom.appendChild(element.dom);
};

/** @deprecated Use `parent.dom.insertBefore(element.dom, parent.dom.childNodes[index])` instead. */
const appendAt = (parent: SugarElement<Node>, element: SugarElement<Node>, index: number): void => {
  parent.dom.insertBefore(element.dom, parent.dom.childNodes[index]);
};

const wrap = (element: SugarElement<Node>, wrapper: SugarElement<Node>): void => {
  element.dom.parentNode?.insertBefore(wrapper.dom, element.dom)
  wrapper.dom.appendChild(element.dom);
};

export {
  before,
  after,
  prepend,
  append,
  appendAt,
  wrap
};
