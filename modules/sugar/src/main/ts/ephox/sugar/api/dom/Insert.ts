import { SugarElement } from '../node/SugarElement';

/** @deprecated Use `marker.dom.before(element.dom)` instead. */
const before = (marker: SugarElement<Node>, element: SugarElement<Node>): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

/** @deprecated Use `marker.dom.after(element.dom)` instead. */
const after = (marker: SugarElement<Node>, element: SugarElement<Node>): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

/** @deprecated Use `parent.dom.prepend(element.dom)` instead. */
const prepend = (parent: SugarElement<Node>, element: SugarElement<Node>): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

/** @deprecated Use `parent.dom.append(element.dom)` instead. */
const append = (parent: SugarElement<Node>, element: SugarElement<Node>): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

/** @deprecated Use `parent.dom.insertBefore(element.dom, parent.dom.childNodes[index])` instead or see if you can refactor to make it all smaller. */
const appendAt = (parent: SugarElement<Node>, element: SugarElement<Node>, index: number): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

/** @todo Do we really need this? */
const wrap = (element: SugarElement<Element>, wrapper: SugarElement<Element>): void => {
  element.dom.after(wrapper.dom);
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
