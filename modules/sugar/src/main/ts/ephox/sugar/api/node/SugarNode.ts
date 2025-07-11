import { HTMLElementFullTagNameMap } from '../../alien/DomTypes';
import * as NodeTypes from './NodeTypes';
import { SugarElement } from './SugarElement';

/** @deprecated Use `element.dom.nodeName.toLowerCase()` instead or leave this? why do we need this check anyway? */
const name = (element: SugarElement<Node>): string => {
  const r = element.dom.nodeName;
  return r.toLowerCase();
};

/** @deprecated Use `element.dom.nodeType` instead */
const type = (element: SugarElement<Node>): number =>
  element.dom.nodeType;

/** @deprecated Use `element.dom.nodeValue` instead */
const value = (element: SugarElement<Node>): string | null =>
  element.dom.nodeValue;

const isType = <E extends Node> (t: number) => (element: SugarElement<Node>): element is SugarElement<E> =>
  type(element) === t;

const isComment = (element: SugarElement<Node>): element is SugarElement<Comment> =>
  type(element) === NodeTypes.COMMENT || name(element) === '#comment';

const isHTMLElement = (element: SugarElement<Node>): element is SugarElement<HTMLElement> =>
  isElement(element) && element.dom.namespaceURI === 'http://www.w3.org/1999/xhtml';

const isElement = isType<Element>(NodeTypes.ELEMENT);
const isText = isType<Text>(NodeTypes.TEXT);
const isDocument = isType<Document>(NodeTypes.DOCUMENT);
const isDocumentFragment = isType<DocumentFragment>(NodeTypes.DOCUMENT_FRAGMENT);

/** @deprecated use element.dom.nodeName.toLowerCase() === tag if you surely have Element, otherwise check iselement or live with #text hmm */
const isTag = <K extends keyof HTMLElementFullTagNameMap>(tag: K) => (e: SugarElement<Node>): e is SugarElement<HTMLElementFullTagNameMap[K]> =>
  isElement(e) && e.dom.nodeName === tag;

export {
  name,
  type,
  value,
  isElement,
  isHTMLElement,
  isText,
  isDocument,
  isDocumentFragment,
  isComment,
  isTag
};
