
import DOMUtils from '../api/dom/DOMUtils';
import TextSeeker from '../api/dom/TextSeeker';
import * as NodeType from '../dom/NodeType';
import * as Spot from './Spot';

const DOM = DOMUtils.DOM;

export type ProcessCallback = (element: Text, offset: number, text: string) => number;

const alwaysNext = (startNode: Node) => (node: Node): number =>
  startNode === node ? -1 : 0;

// This largely is derived from robins isBoundary check, however it also treats contenteditable=false elements as a boundary
// See robins `Structure.isEmptyTag` for the list of quasi block elements
const isBoundary = (dom: DOMUtils) => (node: Node): boolean =>
  dom.isBlock(node) || ([ 'BR', 'IMG', 'HR', 'INPUT' ]).includes(node.nodeName) || dom.getContentEditable(node) === 'false';

// Finds the text node before the specified node, or just returns the node if it's already on a text node
const textBefore = (node: Node, offset: number, rootNode: Node): (Spot.SpotPoint<Text>) | null => {
  if (NodeType.isText(node) && offset >= 0) {
    return Spot.point(node, offset);
  } else {
    const textSeeker = TextSeeker(DOM);
    return (textSeeker.backwards(node, offset, alwaysNext(node), rootNode) ?? null).map((prev) => Spot.point(prev.container, prev.container.data.length));
  }
};

const textAfter = (node: Node, offset: number, rootNode: Node): (Spot.SpotPoint<Text>) | null => {
  if (NodeType.isText(node) && offset >= node.length) {
    return Spot.point(node, offset);
  } else {
    const textSeeker = TextSeeker(DOM);
    return (textSeeker.forwards(node, offset, alwaysNext(node), rootNode) ?? null).map((prev) => Spot.point(prev.container, 0));
  }
};

const scanLeft = (node: Text, offset: number, rootNode: Node): (Spot.SpotPoint<Text>) | null => {
  if (!NodeType.isText(node)) {
    return null;
  }
  const text = node.data;
  if (offset >= 0 && offset <= text.length) {
    return Spot.point(node, offset);
  } else {
    const textSeeker = TextSeeker(DOM);
    return (textSeeker.backwards(node, offset, alwaysNext(node), rootNode) ?? null).bind((prev) => {
      const prevText = prev.container.data;
      return scanLeft(prev.container, offset + prevText.length, rootNode);
    });
  }
};

const scanRight = (node: Text, offset: number, rootNode: Node): (Spot.SpotPoint<Text>) | null => {
  if (!NodeType.isText(node)) {
    return null;
  }
  const text = node.data;
  if (offset <= text.length) {
    return Spot.point(node, offset);
  } else {
    const textSeeker = TextSeeker(DOM);
    return (textSeeker.forwards(node, offset, alwaysNext(node), rootNode) ?? null).bind((next) => scanRight(next.container, offset - text.length, rootNode));
  }
};

const repeatLeft = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode?: Node): (Spot.SpotPoint<Text>) | null => {
  const search = TextSeeker(dom, isBoundary(dom));
  return (search.backwards(node, offset, process, rootNode) ?? null);
};

const repeatRight = (dom: DOMUtils, node: Node, offset: number, process: ProcessCallback, rootNode?: Node): (Spot.SpotPoint<Text>) | null => {
  const search = TextSeeker(dom, isBoundary(dom));
  return (search.forwards(node, offset, process, rootNode) ?? null);
};

export {
  repeatLeft,
  repeatRight,
  scanLeft,
  scanRight,
  textBefore,
  textAfter
};
