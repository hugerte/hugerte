import Editor from 'hugerte/core/api/Editor';

const setup = (editor: Editor): void => {
  editor.addShortcut('Meta+K', '', () => {
    editor.execCommand('mceLink');
  });
};

export {
  setup
};
