import Editor from 'hugerte/core/api/Editor';

import * as DownloadImages from '../core/DownloadImages';

const register = (editor: Editor): void => {
  editor.ui.registry.addButton('downloadimages', {
    icon: 'upload',
    tooltip: 'Download remote images',
    onAction: () => {
      DownloadImages.downloadAndReplaceImages(editor);
    }
  });

  editor.ui.registry.addMenuItem('downloadimages', {
    icon: 'upload',
    text: 'Download remote images',
    onAction: () => {
      DownloadImages.downloadAndReplaceImages(editor);
    }
  });
};

export {
  register
};
