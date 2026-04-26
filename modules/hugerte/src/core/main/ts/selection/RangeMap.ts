import { Optional } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as CaretFinder from '../caret/CaretFinder';
import * as NodeType from '../dom/NodeType';

const findFirstCaretElement = (editor: Editor): (Node) | null =>
  CaretFinder.firstPositionIn(editor.getBody())
    .bind((caret) => {
      const container = caret.container();
      return (NodeType.isText(container) ? container.parentNode : container ?? null);
    });

const getCaretElement = (editor: Editor): (Node) | null =>
  (editor.selection.getRng() ?? null)
    .bind((rng) => {
      const root = editor.getBody();
      const atStartOfNode = rng.startContainer === root && rng.startOffset === 0;
      return atStartOfNode ? null : (editor.selection.getStart(true) ?? null);
    });

export const bindRange = <T>(editor: Editor, binder: (node: SugarElement<Element>) => (T) | null): (T) | null =>
  getCaretElement(editor)
    .orThunk(((..._rest: any[]) => (findFirstCaretElement)(editor, ..._rest)))
    .map(SugarElement.fromDom)
    .filter(SugarNode.isElement)
    .bind(binder);

export const mapRange = <T>(editor: Editor, mapper: (node: SugarElement<Element>) => T): (T) | null =>
  bindRange(editor, ((a: any) => (Optional.some)((mapper)(a))));
