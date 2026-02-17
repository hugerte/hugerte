import { Fun } from '@ephox/katamari';

import { SugarElement } from './SugarElement';
import { getShadowHost, getShadowRoot } from './SugarShadowDom';

// Node.contains() is very, very, very good performance
// http://jsperf.com/closest-vs-contains/5
const inBody = (element: SugarElement<Node>): boolean => {
  // use ownerDocument.body to ensure this works inside iframes.
  // Normally contains is bad because an element "contains" itself, but here we want that.
  if (element.dom === undefined || element.dom === null || element.dom.ownerDocument === null) {
    return false;
  }

  const doc = element.dom.ownerDocument;
  return getShadowRoot(SugarElement.fromDom(element.dom)).fold(
    () => doc.body.contains(element.dom),
    Fun.compose1(inBody, getShadowHost)
  );
};

const body = (): SugarElement<HTMLElement> =>
  getBody(SugarElement.fromDom(document));

const getBody = (doc: SugarElement<Document>): SugarElement<HTMLElement> => {
  const b = doc.dom.body;
  if (b === null || b === undefined) {
    throw new Error('Body is not available yet');
  }
  return SugarElement.fromDom(b);
};

export {
  body,
  getBody,
  inBody
};
