import { SugarElement } from './SugarElement';

/** @deprecated Use SugarElement.fromDom(document) instead */
export const getDocument = (): SugarElement<Document> =>
  SugarElement.fromDom(document);
