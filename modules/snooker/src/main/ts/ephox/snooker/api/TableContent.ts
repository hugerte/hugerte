import { Arr } from '@ephox/katamari';
import { DomStructure } from '@ephox/robin';
import { Compare, CursorPosition, InsertAll, NodeTypes, PredicateFind, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

const merge = (cells: SugarElement<HTMLTableCellElement>[]): void => {
  const isBr = SugarNode.isTag('br');

  const advancedBr = (children: Text[]) => {
    return Arr.forall(children, (c) => {
      return c.nodeName === 'br' || (c.nodeType === NodeTypes.TEXT && c.nodeValue!.trim().length === 0); // TODO for Text it should be string, not possibly null, in TS!
    });
  };

  const isListItem = (el: SugarElement<Node>) => {
    return SugarNode.name(el) === 'li' || PredicateFind.ancestor(el, DomStructure.isList).isSome();
  };

  const siblingIsBlock = (el: SugarElement<Node>) => {
    return Traverse.nextSibling(el).map((rightSibling) => {
      if (DomStructure.isBlock(rightSibling)) {
        return true;
      }
      if (DomStructure.isEmptyTag(rightSibling)) {
        return SugarNode.name(rightSibling) === 'img' ? false : true;
      }
      return false;
    }).getOr(false);
  };

  const markCell = (cell: SugarElement<HTMLTableCellElement>) => {
    return CursorPosition.last(cell).bind((rightEdge) => {
      const rightSiblingIsBlock = siblingIsBlock(rightEdge);
      return Traverse.parent(rightEdge).map((parent) => {
        return rightSiblingIsBlock === true || isListItem(parent) || isBr(rightEdge) || (DomStructure.isBlock(parent) && !Compare.eq(cell, parent)) ? [] : [ SugarElement.fromTag('br') ];
      });
    }).getOr([]);
  };

  const markContent = () => {
    const content = Arr.bind(cells, (cell) => {
      return advancedBr(cell.dom.childNodes as unknown as Text[] /* TODO*/) ? [ ] : Array.from(cell.dom.childNodes).map(SugarElement.fromDom).concat(markCell(cell));
    });

    return content.length === 0 ? [ SugarElement.fromTag('br') ] : content;
  };

  const contents = markContent();
  Remove.empty(cells[0]);
  InsertAll.append(cells[0], contents);
};

export {
  merge
};
