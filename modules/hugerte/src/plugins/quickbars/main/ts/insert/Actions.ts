
import Editor from 'hugerte/core/api/Editor';

const insertTable = (editor: Editor, columns: number, rows: number): void => {
  editor.execCommand('mceInsertTable', false, { rows, columns });
};

const insertBlob = (editor: Editor, base64: string, blob: Blob): void => {
  const blobCache = editor.editorUpload.blobCache;
  const blobInfo = blobCache.create((('mceu') + '_' + Math.floor(Math.random() * 1e9) + Date.now()), blob, base64);
  blobCache.add(blobInfo);

  editor.insertContent(editor.dom.createHTML('img', { src: blobInfo.blobUri() }));
};

export {
  insertTable,
  insertBlob
};
