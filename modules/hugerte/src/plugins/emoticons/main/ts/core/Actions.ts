import Editor from 'hugerte/core/api/Editor';

const insertEmoticon = (editor: Editor, ch: string): void => {
  editor.insertContent(ch);
};

export {
  insertEmoticon
};
