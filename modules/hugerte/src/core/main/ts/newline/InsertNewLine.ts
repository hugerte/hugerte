
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as DeleteUtils from '../delete/DeleteUtils';
import * as InputEvents from '../events/InputEvents';
import * as InsertBlock from './InsertBlock';
import * as InsertBr from './InsertBr';
import * as NewLineAction from './NewLineAction';

interface BreakType {
  readonly insert: (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => void;
  readonly fakeEventName: string;
}

const insertBreak = (breakType: BreakType, editor: Editor, evt?: EditorEvent<KeyboardEvent>): void => {
  if (!editor.selection.isCollapsed()) {
    // IMPORTANT: We want to use the editor execCommand here, so that our `delete` execCommand
    // overrides will be considered.
    DeleteUtils.execEditorDeleteCommand(editor);
  }
  if ((evt) != null) {
    const event = InputEvents.fireBeforeInputEvent(editor, breakType.fakeEventName);
    if (event.isDefaultPrevented()) {
      return;
    }
  }

  breakType.insert(editor, evt);

  if ((evt) != null) {
    InputEvents.fireInputEvent(editor, breakType.fakeEventName);
  }
};

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>): void => {
  const br = () => insertBreak(InsertBr.linebreak, editor, evt);
  const block = () => insertBreak(InsertBlock.blockbreak, editor, evt);

  const logicalAction = NewLineAction.getAction(editor, evt);

  switch (Options.getNewlineBehavior(editor)) {
    case 'linebreak':
      logicalAction.fold(br, br, () => {});
      break;
    case 'block':
      logicalAction.fold(block, block, () => {});
      break;
    case 'invert':
      logicalAction.fold(block, br, () => {});
      break;
    // implied by the options processor, unnecessary
    // case 'default':
    default:
      logicalAction.fold(br, block, () => {});
      break;
  }
};

export {
  insert,
  insertBreak
};
