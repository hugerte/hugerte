import { TestStore, UiFinder } from "@hugerte/agar";
import { SugarBody } from "@hugerte/sugar";
import { TinyUiActions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import { Dialog } from 'hugerte/core/api/ui/Ui';
import { WindowParams } from 'hugerte/core/api/WindowManager';

const open = <T extends Dialog.DialogData>(editor: Editor, spec: Dialog.DialogSpec<T>, params: WindowParams): Dialog.DialogInstanceApi<T> =>
  editor.windowManager.open(spec, params);

const openWithStore = <T extends Dialog.DialogData>(editor: Editor, spec: Dialog.DialogSpec<T>, params: WindowParams, store: TestStore): Dialog.DialogInstanceApi<T> => {
  const dialogSpec = {
    onSubmit: store.adder('onSubmit'),
    onClose: store.adder('onClose'),
    onCancel: store.adder('onCancel'),
    onChange: store.adder('onChange'),
    onAction: store.adder('onAction'),
    ...spec
  };
  return open(editor, dialogSpec, params);
};

const close = (editor: Editor): void => {
  TinyUiActions.closeDialog(editor);
  UiFinder.notExists(SugarBody.body(), 'div[role=dialog]');
};

export {
  close,
  open,
  openWithStore
};
