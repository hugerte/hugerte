import { Optional } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import Editor from '../api/Editor';
import * as BlockMergeBoundary from './BlockMergeBoundary';
import * as MergeBlocks from './MergeBlocks';

const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> => {
  const rootNode = SugarElement.fromDom(editor.getBody());

  const position = BlockMergeBoundary.read(editor.schema, rootNode.dom, forward, editor.selection.getRng())
    .map((blockBoundary) =>
      () => {
        MergeBlocks.mergeBlocks(rootNode, forward, blockBoundary.from.block, blockBoundary.to.block, editor.schema)
          .each((pos) => {
            editor.selection.setRng(pos.toRange());
          });
      });

  return position;
};

export {
  backspaceDelete
};
