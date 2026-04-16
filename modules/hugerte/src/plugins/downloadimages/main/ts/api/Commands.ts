import Editor from 'hugerte/core/api/Editor';

import * as DownloadImages from '../core/DownloadImages';

const register = (editor: Editor): void => {
  editor.addCommand('mceDownloadImages', () => {
    DownloadImages.downloadAndReplaceImages(editor);
  });
};

export {
  register
};
