import { Attribute, Remove, SugarElement } from '@ephox/sugar';

import Tools from '../api/util/Tools';
import * as Zwsp from '../text/Zwsp';

// TINY-10305: Map over array for faster lookup.
const unescapedTextParents = Tools.makeMap('NOSCRIPT STYLE SCRIPT XMP IFRAME NOEMBED NOFRAMES PLAINTEXT', ' ');

const containsZwsp = (node: Node): boolean => typeof (node.nodeValue) === 'string' && node.nodeValue.includes(Zwsp.ZWSP);

const getTemporaryNodeSelector = (tempAttrs: string[]): string =>
  `${tempAttrs.length === 0 ? '' : `${(tempAttrs).map((attr) => `[${attr}]`).join(',')},`}[data-mce-bogus="all"]`;

const getTemporaryNodes = (tempAttrs: string[], body: HTMLElement): NodeListOf<Element> =>
  body.querySelectorAll(getTemporaryNodeSelector(tempAttrs));

const createZwspCommentWalker = (body: HTMLElement): TreeWalker =>
  document.createTreeWalker(body, NodeFilter.SHOW_COMMENT, (node) => containsZwsp(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP);

const createUnescapedZwspTextWalker = (body: HTMLElement): TreeWalker =>
  document.createTreeWalker(body, NodeFilter.SHOW_TEXT, (node) => {
    if (containsZwsp(node)) {
      const parent = node.parentNode;
      return parent && Object.prototype.hasOwnProperty.call(unescapedTextParents, parent.nodeName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    } else {
      return NodeFilter.FILTER_SKIP;
    }
  });

const hasZwspComment = (body: HTMLElement): boolean =>
  createZwspCommentWalker(body).nextNode() !== null;

const hasUnescapedZwspText = (body: HTMLElement): boolean =>
  createUnescapedZwspTextWalker(body).nextNode() !== null;

const hasTemporaryNode = (tempAttrs: string[], body: HTMLElement): boolean =>
  body.querySelector(getTemporaryNodeSelector(tempAttrs)) !== null;

const trimTemporaryNodes = (tempAttrs: string[], body: HTMLElement): void => {
  (getTemporaryNodes(tempAttrs, body)).forEach((elm) => {
    const element = SugarElement.fromDom(elm);
    if (Attribute.get(element, 'data-mce-bogus') === 'all') {
      Remove.remove(element);
    } else {
      (tempAttrs).forEach((attr) => {
        if (Attribute.has(element, attr)) {
          Attribute.remove(element, attr);
        }
      });
    }
  });
};

const emptyAllNodeValuesInWalker = (walker: TreeWalker): void => {
  let curr = walker.nextNode();
  while (curr !== null) {
    curr.nodeValue = null;
    curr = walker.nextNode();
  }
};

const emptyZwspComments = ((x: any) => (emptyAllNodeValuesInWalker)((createZwspCommentWalker)(x)));

const emptyUnescapedZwspTexts = ((x: any) => (emptyAllNodeValuesInWalker)((createUnescapedZwspTextWalker)(x)));

const trim = (body: HTMLElement, tempAttrs: string[]): HTMLElement => {
  const conditionalTrims: { condition: (elm: HTMLElement) => boolean; action: (elm: HTMLElement) => void }[] = [
    {
      condition: ((..._rest: any[]) => (hasTemporaryNode)(tempAttrs, ..._rest)),
      action: ((..._rest: any[]) => (trimTemporaryNodes)(tempAttrs, ..._rest))
    },
    {
      condition: hasZwspComment,
      action: emptyZwspComments
    },
    {
      condition: hasUnescapedZwspText,
      action: emptyUnescapedZwspTexts
    }
  ];

  let trimmed = body;
  let cloned = false;

  (conditionalTrims).forEach(({ condition, action }) => {
    if (condition(trimmed)) {
      if (!cloned) {
        trimmed = body.cloneNode(true) as HTMLElement;
        cloned = true;
      }
      action(trimmed);
    }
  });

  return trimmed;
};

export {
  trim,
  hasTemporaryNode,
  hasZwspComment,
  hasUnescapedZwspText,
  trimTemporaryNodes,
  emptyZwspComments,
  emptyUnescapedZwspTexts
};
