
import DomTreeWalker from '../api/dom/TreeWalker';
import * as NodeType from './NodeType';

interface TextWalker {
  current (): (Text) | null;
  next (): (Text) | null;
  prev (): (Text) | null;
  prev2 (): (Text) | null;
}

const TextWalker = (startNode: Node, rootNode: Node, isBoundary: (node: Node) => boolean = (() => false as const)): TextWalker => {
  const walker = new DomTreeWalker(startNode, rootNode);

  const walk = (direction: 'next' | 'prev' | 'prev2'): (Text) | null => {
    let next: Node | null | undefined;
    do {
      next = walker[direction]();
    } while (next && !NodeType.isText(next) && !isBoundary(next));
    return (next ?? null).filter(NodeType.isText);
  };

  return {
    current: () => (walker.current() ?? null).filter(NodeType.isText),
    next: () => walk('next'),
    prev: () => walk('prev'),
    prev2: () => walk('prev2')
  };
};

export {
  TextWalker
};
