import { Optional } from '@ephox/katamari';

import { NodeValue } from '../../impl/NodeValue';
import { SugarElement } from './SugarElement';
import * as SugarNode from './SugarNode';

// can only get text value of a text node
const api = NodeValue(SugarNode.isText, 'text');

/** @deprecated just get element.dom.nodeValue */
const get = (element: SugarElement<Text>): string =>
  element.dom.nodeValue || '';

/** @deprecated */
const getOption = (element: SugarElement<Node>): Optional<string> =>
  api.getOption(element);

/** @deprecated */
const set = (element: SugarElement<Text>, value: string): void => {
  element.dom.nodeValue = value;
};

export {
  get,
  getOption,
  set
};
