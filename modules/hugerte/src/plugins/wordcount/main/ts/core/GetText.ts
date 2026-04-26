
import DomTreeWalker from 'hugerte/core/api/dom/TreeWalker';
import Schema, { SchemaMap } from 'hugerte/core/api/html/Schema';

const getText = (node: Node, schema: Schema): string[] => {
  const blockElements: SchemaMap = schema.getBlockElements();
  const voidElements: SchemaMap = schema.getVoidElements();

  const isNewline = (node: Node) => blockElements[node.nodeName] || voidElements[node.nodeName];

  const textBlocks: string[] = [];
  let txt = '';
  const treeWalker = new DomTreeWalker(node, node);

  let tempNode: Node | null | undefined;
  while ((tempNode = treeWalker.next())) {
    if (tempNode.nodeType === 3) {
      txt += ((tempNode as Text).data).replace(/\uFEFF/g, '');
    } else if (isNewline(tempNode) && txt.length) {
      textBlocks.push(txt);
      txt = '';
    }
  }

  if (txt.length) {
    textBlocks.push(txt);
  }

  return textBlocks;
};

export {
  getText
};
