import { Arr, Fun, Optional, Optionals } from '@ephox/katamari';
import { Compare, PredicateFind, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import EditorSelection from '../api/dom/Selection';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as DeleteUtils from './DeleteUtils';
import * as MergeBlocks from './MergeBlocks';

// Removes empty anchor elements left behind when a range delete deletes the content of links.
// For example deleting two links in a list via `Range.deleteContents()` keeps the partially
// selected <a> containers, leaving empty links in the merged result.
// Only the affected blocks are walked, so anchors elsewhere in the document are never touched,
// and anchors that still have content (text, images, ZWSP, named/id anchors, non-editable
// widgets) are preserved since `Empty.isEmpty` doesn't consider them empty.
const removeEmptyAnchors = (schema: Schema, block: SugarElement<Element>): void => {
  const visit = (elm: SugarElement<Node>): void => {
    Arr.each(Traverse.children(elm), (child) => {
      if (SugarNode.isHTMLElement(child)) {
        if (SugarNode.name(child) === 'a' && Empty.isEmpty(schema, child)) {
          Remove.remove(child);
        } else {
          visit(child);
        }
      }
    });
  };

  visit(block);
};

const deleteRangeMergeBlocks = (rootNode: SugarElement<Node>, selection: EditorSelection, schema: Schema): Optional<() => void> => {
  const rng = selection.getRng();

  return Optionals.lift2(
    DeleteUtils.getParentBlock(rootNode, SugarElement.fromDom(rng.startContainer)),
    DeleteUtils.getParentBlock(rootNode, SugarElement.fromDom(rng.endContainer)),
    (block1, block2) => {
      if (!Compare.eq(block1, block2)) {
        return Optional.some(() => {
          rng.deleteContents();

          // Clean up empty <a> containers left behind by the deletion before merging the blocks,
          // so the merge/padding logic sees the same structure as a plain text range delete.
          removeEmptyAnchors(schema, block1);
          removeEmptyAnchors(schema, block2);

          MergeBlocks.mergeBlocks(rootNode, true, block1, block2, schema).each((pos) => {
            selection.setRng(pos.toRange());
          });

        });
      } else {
        return Optional.none();
      }
    }).getOr(Optional.none());
};

const isRawNodeInTable = (root: SugarElement<Node>, rawNode: Node): boolean => {
  const node = SugarElement.fromDom(rawNode);
  const isRoot = Fun.curry(Compare.eq, root);
  return PredicateFind.ancestor(node, ElementType.isTableCell, isRoot).isSome();
};

const isSelectionInTable = (root: SugarElement<Node>, rng: Range): boolean =>
  isRawNodeInTable(root, rng.startContainer) || isRawNodeInTable(root, rng.endContainer);

const isEverythingSelected = (root: SugarElement<Node>, rng: Range): boolean => {
  const noPrevious = CaretFinder.prevPosition(root.dom, CaretPosition.fromRangeStart(rng)).isNone();
  const noNext = CaretFinder.nextPosition(root.dom, CaretPosition.fromRangeEnd(rng)).isNone();
  return !isSelectionInTable(root, rng) && noPrevious && noNext;
};

const emptyEditor = (editor: Editor): Optional<() => void> => {
  return Optional.some(() => {
    editor.setContent('');
    editor.selection.setCursorLocation();
  });
};

const deleteRange = (editor: Editor): Optional<() => void> => {
  const rootNode = SugarElement.fromDom(editor.getBody());
  const rng = editor.selection.getRng();
  return isEverythingSelected(rootNode, rng) ? emptyEditor(editor) : deleteRangeMergeBlocks(rootNode, editor.selection, editor.schema);
};

const backspaceDelete = (editor: Editor, _forward: boolean): Optional<() => void> =>
  editor.selection.isCollapsed() ? Optional.none() : deleteRange(editor);

export {
  backspaceDelete
};
