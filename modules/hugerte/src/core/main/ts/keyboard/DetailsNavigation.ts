
import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as LineReader from '../caret/LineReader';

const moveUp = (editor: Editor, details: HTMLDetailsElement, summary: HTMLElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (root.firstChild === details && LineReader.isAtFirstLine(summary, pos)) {
    editor.execCommand('InsertNewBlockBefore');
    return true;
  } else {
    return false;
  }
};

const moveDown = (editor: Editor, details: HTMLDetailsElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (root.lastChild === details && LineReader.isAtLastLine(details, pos)) {
    editor.execCommand('InsertNewBlockAfter');
    return true;
  } else {
    return false;
  }
};

const move = (editor: Editor, forward: boolean) => {
  if (forward) {
    return (editor.dom.getParent<HTMLDetailsElement>(editor.selection.getNode(), 'details') ?? null)
      .map((details) => moveDown(editor, details))
       ?? (false);
  } else {
    return (editor.dom.getParent<HTMLElement>(editor.selection.getNode(), 'summary') ?? null)
      .bind((summary) => (editor.dom.getParent(summary, 'details') ?? null)
        .map((details) => moveUp(editor, details, summary))
      ) ?? (false);
  }
};

const moveV = (editor: Editor, forward: boolean): boolean => move(editor, forward);

export {
  moveV
};
