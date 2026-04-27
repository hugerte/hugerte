import Editor from 'hugerte/core/api/Editor';

import * as DownloadImages from '../core/DownloadImages';

const register = (editor: Editor): void => {
  editor.addCommand('mceDownloadImages', () => {
    DownloadImages.downloadAndReplaceImages(editor);
  });

  editor.addCommand('mceDownloadImage', () => {
    const node = editor.selection.getNode();
    if (node.nodeName === 'IMG') {
      const src = node.getAttribute('data-mce-src') || (node as HTMLImageElement).src;
      if (DownloadImages.isExternalUrl(src)) {
        DownloadImages.downloadSingleImage(editor, node as HTMLImageElement);
      }
    }
  });
};

export {
  register
};
