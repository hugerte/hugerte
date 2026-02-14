import Editor from 'hugerte/core/api/Editor';

const register = (editor: Editor): void => {
  editor.addCommand('mceDownloadImage', () => {
    editor.execCommand('mceImageDownloadDialog');
  });

  editor.addCommand('mceDownloadExternalImages', async () => {
    const { downloadImagesInSelection } = await import('../core/DownloadImage');
    try {
      const count = await downloadImagesInSelection(editor);
      if (count > 0) {
        editor.notificationManager.open({
          text: `Downloaded ${count} image${count === 1 ? '' : 's'}`,
          type: 'success'
        });
      } else {
        editor.notificationManager.open({
          text: 'No external images found in selection',
          type: 'info'
        });
      }
    } catch (err) {
      editor.notificationManager.open({
        text: 'Failed to download images: ' + (err as Error).message,
        type: 'error'
      });
    }
  });

  editor.addCommand('mceDownloadAllExternalImages', async () => {
    const { downloadAllExternalImages } = await import('../core/DownloadImage');
    try {
      const count = await downloadAllExternalImages(editor);
      if (count > 0) {
        editor.notificationManager.open({
          text: `Downloaded ${count} image${count === 1 ? '' : 's'}`,
          type: 'success'
        });
      } else {
        editor.notificationManager.open({
          text: 'No external images found in editor',
          type: 'info'
        });
      }
    } catch (err) {
      editor.notificationManager.open({
        text: 'Failed to download images: ' + (err as Error).message,
        type: 'error'
      });
    }
  });
};

export {
  register
};
