import { SugarElement, SugarNode } from '@ephox/sugar';

import * as AlloyTags from '../ephemera/AlloyTags';
import * as AlloyLogger from '../log/AlloyLogger';

const prefix = AlloyTags.prefix();
const idAttr = AlloyTags.idAttr();

const write = (label: string, elem: SugarElement<Element>): string => {
  const id: string = ((prefix + label) + '_' + Math.floor(Math.random() * 1e9) + Date.now());
  writeOnly(elem, id);
  return id;
};

const writeOnly = (elem: SugarElement<Node>, uid: string | null): void => {
  Object.defineProperty(elem.dom, idAttr, {
    value: uid,
    writable: true
  });
};

const read = (elem: SugarElement<Node>): (string) | null => {
  const id = SugarNode.isElement(elem) ? (elem.dom as any)[idAttr] : null;
  return (id ?? null);
};

const readOrDie = (elem: SugarElement<Node>): string => read(elem).getOrDie('Could not find alloy uid in: ' + AlloyLogger.element(elem));

const generate = (prefix: string): string => ((prefix) + '_' + Math.floor(Math.random() * 1e9) + Date.now());

const revoke = (elem: SugarElement<Node>): void => {
  // This looks like it is only used by ForeignGui, which is experimental.
  writeOnly(elem, null);
};

// TODO: Consider deprecating.
const attribute: () => string = () => idAttr;

export {
  revoke,
  write,
  writeOnly,
  read,
  readOrDie,
  generate,
  attribute
};
