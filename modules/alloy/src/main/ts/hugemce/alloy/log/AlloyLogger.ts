import { SugarElement, Truncate } from '@hugemce/sugar';

const element = (elem: SugarElement<Node>): string => Truncate.getHtml(elem);

export {
  element
};
