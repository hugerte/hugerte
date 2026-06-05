import Editor from 'hugerte/core/api/Editor';
import { Menu, Toolbar } from 'hugerte/core/api/ui/Ui';

import * as DownloadImages from '../core/DownloadImages';

const onSetupDownloadImages = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): VoidFunction => {
  const nodeChanged = () => {
    api.setEnabled(editor.selection.isEditable() && DownloadImages.findExternalImages(editor).length > 0);
  };

  editor.on('NodeChange', nodeChanged);
  nodeChanged();

  return () => {
    editor.off('NodeChange', nodeChanged);
  };
};

const register = (editor: Editor): void => {
  editor.ui.registry.addButton('downloadimages', {
    icon: 'image',
    tooltip: 'Download remote images',
    onAction: () => {
      editor.execCommand('mceDownloadImages');
    },
    onSetup: onSetupDownloadImages(editor)
  });

  editor.ui.registry.addMenuItem('downloadimages', {
    icon: 'image',
    text: 'Download remote images',
    onAction: () => {
      editor.execCommand('mceDownloadImages');
    },
    onSetup: onSetupDownloadImages(editor)
  });

  editor.ui.registry.addMenuItem('downloadimages-single', {
    icon: 'image',
    text: 'Download image',
    onAction: () => {
      editor.execCommand('mceDownloadImage');
    }
  });

  editor.ui.registry.addContextMenu('downloadimages', {
    update: (element) => {
      if (element.nodeName === 'IMG' && editor.dom.isEditable(element)) {
        const src = element.getAttribute('data-mce-src') || (element as HTMLImageElement).src;
        return DownloadImages.isExternalUrl(src) ? 'downloadimages-single' : '';
      }
      return '';
    }
  });
};

export {
  register
};
