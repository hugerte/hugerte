
import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import Formatter from '../api/Formatter';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import { Format, InlineFormat } from './FormatTypes';
import * as FormatUtils from './FormatUtils';

export const listItemStyles = [ 'fontWeight', 'fontStyle', 'color', 'fontSize', 'fontFamily' ];

const hasListStyles = (fmt: InlineFormat) => (typeof (fmt.styles) === 'object' && (fmt.styles) !== null) && (Object.keys(fmt.styles)).some((name) => (listItemStyles).includes(name));

const findExpandedListItemFormat = (formats: Format[]) =>
  ((formats).find((fmt) => FormatUtils.isInlineFormat(fmt) && fmt.inline === 'span' && hasListStyles(fmt)) ?? null);

export const getExpandedListItemFormat = (formatter: Formatter, format: string): (Format) | null => {
  const formatList = formatter.get(format);

  return Array.isArray(formatList) ? findExpandedListItemFormat(formatList) : null;
};

const isRngStartAtStartOfElement = (rng: Range, elm: Element) => CaretFinder.prevPosition(elm, CaretPosition.fromRangeStart(rng)) === null;

const isRngEndAtEndOfElement = (rng: Range, elm: Element) => {
  return CaretFinder.nextPosition(elm, CaretPosition.fromRangeEnd(rng))
    .exists((pos) => !NodeType.isBr(pos.getNode()) || CaretFinder.nextPosition(elm, pos) !== null) === false;
};

const isEditableListItem = (dom: DOMUtils) => (elm: Element) => NodeType.isListItem(elm) && dom.isEditable(elm);

const getFullySelectedBlocks = (selection: EditorSelection) => {
  const blocks = selection.getSelectedBlocks();
  const rng = selection.getRng();

  if (selection.isCollapsed()) {
    return [];
  } if (blocks.length === 1) {
    return isRngStartAtStartOfElement(rng, blocks[0]) && isRngEndAtEndOfElement(rng, blocks[0]) ? blocks : [];
  } else {
    const first = ((blocks)[0] ?? null).filter((elm) => isRngStartAtStartOfElement(rng, elm)).toArray();
    const last = ((blocks).at(-1) ?? null).filter((elm) => isRngEndAtEndOfElement(rng, elm)).toArray();
    const middle = blocks.slice(1, -1);

    return first.concat(middle).concat(last);
  }
};

export const getFullySelectedListItems = (selection: EditorSelection): Element[] =>
  (getFullySelectedBlocks(selection)).filter(isEditableListItem(selection.dom));

export const getPartiallySelectedListItems = (selection: EditorSelection): Element[] =>
  (selection.getSelectedBlocks()).filter(isEditableListItem(selection.dom));
