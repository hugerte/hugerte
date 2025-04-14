import { Arr, Obj, Optional } from '@ephox/katamari';

import { SugarElement } from '../node/SugarElement';
import * as SugarNode from '../node/SugarNode';

/** @deprecated Use `element.dom.setAttribute(key, value.toString())` instead. */
const set = (element: SugarElement<Element>, key: string, value: string | boolean | number): void => {
  element.dom.setAttribute(key, value.toString());
};

const setAll = (element: SugarElement<Element>, attributes: Record<string, string | boolean | number>): void => {
  Object.keys(attributes).forEach((key) => {
    element.dom.setAttribute(key, attributes[key].toString());
  });
};

const setOptions = (element: SugarElement<Element>, attrs: Record<string, Optional<string | boolean | number>>): void => {
  Obj.each(attrs, (v, k) => {
    v.fold(() => {
      element.dom.removeAttribute(k);
    }, (value) => {
      element.dom.setAttribute(k, value.toString());
    });
  });
};

/** @deprecated Use `element.dom.getAttribute(key)` instead, but note that it returns null instead of undefined. */
const get = (element: SugarElement<Element>, key: string): undefined | string => {
  const v = element.dom.getAttribute(key);

  // undefined is the more appropriate value for JS, and this matches JQuery
  return v === null ? undefined : v;
};

const getOpt = (element: SugarElement<Element>, key: string): Optional<string> =>
  Optional.from(get(element, key));

const has = (element: SugarElement<Node>, key: string): boolean => {
  const dom = element.dom;

  // return false for non-element nodes, no point in throwing an error
  return dom && (dom as Element).hasAttribute ? (dom as Element).hasAttribute(key) : false;
};

/** @deprecated Use `element.dom.removeAttribute(key)` instead. */
const remove = (element: SugarElement<Element>, key: string): void => {
  element.dom.removeAttribute(key);
};

const hasNone = (element: SugarElement<Node>): boolean => {
  const attrs = (element.dom as Element).attributes;
  return attrs === undefined || attrs === null || attrs.length === 0;
};

const clone = (element: SugarElement<Element>): Record<string, string> =>
  Arr.foldl(element.dom.attributes, (acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);

const transferOne = (source: SugarElement<Element>, destination: SugarElement<Element>, attr: string): void => {
  // NOTE: We don't want to clobber any existing attributes
  if (!has(destination, attr)) {
    getOpt(source, attr).each((srcValue) => set(destination, attr, srcValue));
  }
};

// Transfer attributes(attrs) from source to destination, unless they are already present
const transfer = (source: SugarElement<Element>, destination: SugarElement<Element>, attrs: string[]): void => {
  if (!SugarNode.isElement(source) || !SugarNode.isElement(destination)) {
    return;
  }
  attrs.forEach((attr) => {
    transferOne(source, destination, attr);
  });
};

export { clone, set, setAll, setOptions, get, getOpt, has, remove, hasNone, transfer };
