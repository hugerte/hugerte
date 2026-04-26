import { Compare, Css, Insert, Replication, SelectorFind, SugarElement, SugarFragment, SugarNode, Traverse } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as SelectionUtils from './SelectionUtils';
import * as SimpleTableModel from './SimpleTableModel';
import * as TableCellSelection from './TableCellSelection';

const findParentListContainer = (parents: SugarElement[]): (SugarElement<HTMLLIElement | HTMLOListElement>) | null =>
  ((parents).find((elm) => SugarNode.name(elm) === 'ul' || SugarNode.name(elm) === 'ol') ?? null);

const getFullySelectedListWrappers = (parents: SugarElement<Node>[], rng: Range) =>
  ((parents).find((elm) => SugarNode.name(elm) === 'li' && SelectionUtils.hasAllContentsSelected(elm, rng)) ?? null).fold(
    () => [],
    (_li) =>
      findParentListContainer(parents).map((listCont) => {
        const listElm = SugarElement.fromTag(SugarNode.name(listCont));
        // Retain any list-style* styles when generating the new fragment
        const listStyles = Object.fromEntries(Object.entries(Css.getAllRaw(listCont)).filter(([_k, _v]: [any, any]) => ((_style, name) => (name).startsWith('list-style'))(_v, _k as any)));
        Css.setAll(listElm, listStyles);
        return [
          SugarElement.fromTag('li'),
          listElm
        ];
      }) ?? ([])
  );

const wrap = (innerElm: SugarElement<Node>, elms: SugarElement<Node>[]) => {
  const wrapped = (elms).reduce((acc, elm) => {
    Insert.append(elm, acc);
    return elm;
  }, innerElm);
  return elms.length > 0 ? SugarFragment.fromElements([ wrapped ]) : wrapped;
};

const directListWrappers = (commonAnchorContainer: SugarElement<Node>) => {
  if (ElementType.isListItem(commonAnchorContainer)) {
    return Traverse.parent(commonAnchorContainer).filter(ElementType.isList).fold(
      () => [],
      (listElm) => [ commonAnchorContainer, listElm ]
    );
  } else {
    return ElementType.isList(commonAnchorContainer) ? [ commonAnchorContainer ] : [ ];
  }
};

const getWrapElements = (rootNode: SugarElement<Node>, rng: Range, schema: Schema) => {
  const commonAnchorContainer = SugarElement.fromDom(rng.commonAncestorContainer);
  const parents = Parents.parentsAndSelf(commonAnchorContainer, rootNode);
  const wrapElements = (parents).filter((el) => schema.isWrapper(SugarNode.name(el)));
  const listWrappers = getFullySelectedListWrappers(parents, rng);
  const allWrappers = wrapElements.concat(listWrappers.length ? listWrappers : directListWrappers(commonAnchorContainer));
  return (allWrappers).map(Replication.shallow);
};

const emptyFragment = () => SugarFragment.fromElements([]);

const getFragmentFromRange = (rootNode: SugarElement<Node>, rng: Range, schema: Schema) =>
  wrap(SugarElement.fromDom(rng.cloneContents()), getWrapElements(rootNode, rng, schema));

const getParentTable = (rootElm: SugarElement<Node>, cell: SugarElement<HTMLTableCellElement>): (SugarElement<HTMLTableElement>) | null =>
  SelectorFind.ancestor(cell, 'table', ((..._rest: any[]) => (Compare.eq)(rootElm, ..._rest)));

const getTableFragment = (rootNode: SugarElement<Node>, selectedTableCells: SugarElement<HTMLTableCellElement>[]) =>
  getParentTable(rootNode, selectedTableCells[0]).bind((tableElm) => {
    const firstCell = selectedTableCells[0];
    const lastCell = selectedTableCells[selectedTableCells.length - 1];
    const fullTableModel = SimpleTableModel.fromDom(tableElm);

    return SimpleTableModel.subsection(fullTableModel, firstCell, lastCell).map((sectionedTableModel) =>
      SugarFragment.fromElements([ SimpleTableModel.toDom(sectionedTableModel) ])
    );
  }).getOrThunk(emptyFragment);

const getSelectionFragment = (rootNode: SugarElement<Node>, ranges: Range[], schema: Schema) =>
  ranges.length > 0 && ranges[0].collapsed ? emptyFragment() : getFragmentFromRange(rootNode, ranges[0], schema);

const read = (rootNode: SugarElement<Element>, ranges: Range[], schema: Schema): SugarElement<Node> => {
  const selectedCells = TableCellSelection.getCellsFromElementOrRanges(ranges, rootNode);
  return selectedCells.length > 0 ? getTableFragment(rootNode, selectedCells) : getSelectionFragment(rootNode, ranges, schema);
};

export {
  read
};
