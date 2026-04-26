import { Awareness, RawRect, SugarElement, SugarNode } from '@ephox/sugar';

import { WindowBridge } from '../api/WindowBridge';
import * as Carets from './Carets';

type Carets = Carets.Carets;

const getPartialBox = (bridge: WindowBridge, element: SugarElement<Node>, offset: number) => {
  if (offset >= 0 && offset < Awareness.getEnd(element)) {
    return bridge.getRangedRect(element, offset, element, offset + 1);
  } else if (offset > 0) {
    return bridge.getRangedRect(element, offset - 1, element, offset);
  }
  return null;
};

const toCaret = (rect: RawRect): Carets => ({
  left: rect.left,
  top: rect.top,
  right: rect.right,
  bottom: rect.bottom
});

const getElemBox = (bridge: WindowBridge, element: SugarElement<Element>) => {
  return bridge.getRect(element);
};

const getBoxAt = (bridge: WindowBridge, element: SugarElement<Node>, offset: number): (Carets) | null => {
  // Note, we might need to consider this offset and descend.
  if (SugarNode.isElement(element)) {
    return getElemBox(bridge, element).map(toCaret);
  } else if (SugarNode.isText(element)) {
    return getPartialBox(bridge, element, offset).map(toCaret);
  } else {
    return null;
  }
};

const getEntireBox = (bridge: WindowBridge, element: SugarElement<Node>): (Carets) | null => {
  if (SugarNode.isElement(element)) {
    return getElemBox(bridge, element).map(toCaret);
  } else if (SugarNode.isText(element)) {
    return bridge.getRangedRect(element, 0, element, Awareness.getEnd(element)).map(toCaret);
  } else {
    return null;
  }
};

export {
  getBoxAt,
  getEntireBox
};
