import Editor from 'hugerte/core/api/Editor';

import * as Actions from '../core/PasteHandler';

const register = (editor: Editor): void => {
  editor.addCommand('InsertAccordion', () => Actions.insertAccordion(editor));
  editor.addCommand('ToggleAccordion', (_ui, value?: boolean) => Actions.toggleAccordion(editor, value));
  editor.addCommand('ToggleAllAccordions', (_ui, value?: boolean) => Actions.toggleAllAccordions(editor, value));
  editor.addCommand('RemoveAccordion', () => Actions.removeAccordion(editor));
};

export { register };
