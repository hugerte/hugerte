import { SugarElement } from '../node/SugarElement';

/** @deprecated Use `marker.dom.before(elements.map(e => e.dom)) instead. */
const before = (marker: SugarElement<Node>, elements: SugarElement<Node>[]): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

/** @deprecated Use `marker.dom.after(elements.map(e => e.dom)) instead. */
const after = (marker: SugarElement<Element>, elements: SugarElement<ChildNode>[]): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

/** @deprecated Use `parent.dom.append(elements.map(e => e.dom)) instead. */
const append = (parent: SugarElement<Node>, elements: SugarElement<Node>[]): void => {
  throw new Error('Deprecated function used. Fix before continuing.');
};

export {
  before,
  after,
  append
};
