import { SugarElement, Truncate } from "@hugerte/sugar";

const element = (elem: SugarElement<Node>): string => Truncate.getHtml(elem);

export {
  element
};
