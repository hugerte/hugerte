import Editor from 'hugerte/core/api/Editor';
import { Menu, Toolbar } from 'hugerte/core/api/ui/Ui';
import { Fun, Optional } from '@ephox/katamari';
import * as Dialog from './Dialog';
import * as DownloadImage from '../core/DownloadImage';

const hasExternalImages = (editor: Editor): boolean => {
  const images = editor.dom.select('img');
  for (const img of images) {
    if (DownloadImage.isExternalUrl(img.src)) {
      return true;
    }
  }
  return false;
};

const hasExternalImageInSelection = (editor: Editor): boolean => {
  const selectedNode = editor.selection.getNode();
  
  if (selectedNode.nodeName === 'IMG') {
    return DownloadImage.isExternalUrl((selectedNode as HTMLImageElement).src);
  }
  
  // Check images in selection
  const imgs = editor.dom.select('img', selectedNode);
  for (const img of imgs) {
    if (DownloadImage.isExternalUrl(img.src)) {
      return true;
    }
  }
  
  return false;
};

const toggleDownloadButtonState = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): () => void => {
  const updateState = () => {
    api.setEnabled(hasExternalImages(editor) && editor.selection.isEditable());
  };
  updateState();
  return Fun.noop;
};

const toggleContextMenuState = (editor: Editor) => (api: Menu.MenuItemInstanceApi): () => void => {
  const updateState = () => {
    api.setEnabled(hasExternalImageInSelection(editor) && editor.selection.isEditable());
  };
  updateState();
  return Fun.noop;
};

const setupButtons = (editor: Editor): void => {
  // Main toolbar button
  editor.ui.registry.addButton('imagedownload', {
    icon: 'download',
    tooltip: 'Download external images',
    onAction: () => Dialog.open(editor),
    onSetup: toggleDownloadButtonState(editor)
  });
  
  // Button to download all external images at once
  editor.ui.registry.addButton('imagedownloadall', {
    icon: 'save',
    tooltip: 'Download all external images',
    onAction: () => Dialog.openMultiDownload(editor),
    onSetup: toggleDownloadButtonState(editor)
  });
};

const setupMenuItems = (editor: Editor): void => {
  editor.ui.registry.addMenuItem('imagedownload', {
    icon: 'download',
    text: 'Download external image...',
    onAction: () => Dialog.open(editor),
    onSetup: toggleDownloadButtonState(editor)
  });
  
  editor.ui.registry.addMenuItem('imagedownloadall', {
    icon: 'save',
    text: 'Download all external images',
    onAction: () => Dialog.openMultiDownload(editor),
    onSetup: toggleDownloadButtonState(editor)
  });
};

const setupContextMenu = (editor: Editor): void => {
  editor.ui.registry.addContextMenu('imagedownload', {
    update: (element) => {
      // Only show context menu for images with external URLs
      if (element.nodeName === 'IMG') {
        const img = element as HTMLImageElement;
        if (DownloadImage.isExternalUrl(img.src) && editor.dom.isEditable(element)) {
          return 'imagedownloadcontext';
        }
      }
      return '';
    }
  });
  
  // Context menu item for downloading the specific image
  editor.ui.registry.addMenuItem('imagedownloadcontext', {
    icon: 'download',
    text: 'Download image to local',
    onAction: async () => {
      const selectedNode = editor.selection.getNode();
      if (selectedNode.nodeName === 'IMG') {
        const img = selectedNode as HTMLImageElement;
        try {
          await DownloadImage.downloadAndReplaceImage(editor, img);
          editor.notificationManager.open({
            text: 'Image downloaded successfully',
            type: 'success'
          });
        } catch (err) {
          editor.notificationManager.open({
            text: 'Failed to download image: ' + (err as Error).message,
            type: 'error'
          });
        }
      }
    },
    onSetup: toggleContextMenuState(editor)
  });
};

export {
  setupButtons,
  setupMenuItems,
  setupContextMenu
};
