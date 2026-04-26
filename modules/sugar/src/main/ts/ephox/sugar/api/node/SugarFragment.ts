

import { SugarElement } from './SugarElement';

const fromElements = (elements: SugarElement<Node>[], scope?: Document | null): SugarElement<DocumentFragment> => {
  const doc = scope || document;
  const fragment = doc.createDocumentFragment();
  elements.forEach((element) => {
    fragment.appendChild(element.dom);
  });
  return SugarElement.fromDom(fragment);
};

export {
  fromElements
};
