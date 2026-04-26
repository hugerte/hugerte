import { SugarElement, Traverse } from '@ephox/sugar';

export interface Navigation {
  readonly view: (doc: SugarElement<Document>) => (SugarElement<Element>) | null;
  readonly owner: (elem: SugarElement<Node>) => SugarElement<Document>;
}

const view = (doc: SugarElement<Document>): (SugarElement<Element>) | null => {
  // Only walk up to the document this script is defined in.
  // This prevents walking up to the parent window when the editor is in an iframe.
  const element = doc.dom === document ? null : (doc.dom.defaultView?.frameElement ?? null);
  return element.map(SugarElement.fromDom);
};

const owner = (element: SugarElement<Node>): SugarElement<Document> => Traverse.documentOrOwner(element);

export {
  view,
  owner
};
