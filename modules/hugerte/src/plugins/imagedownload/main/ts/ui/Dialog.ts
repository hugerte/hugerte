import Editor from 'hugerte/core/api/Editor';
import { Dialog } from 'hugerte/core/api/ui/Ui';
import { Arr, Fun, Optional, Strings, Type } from '@ephox/katamari';
import * as DownloadImage from '../core/DownloadImage';

interface DownloadDialogData {
  src: {
    value: string;
    meta?: Record<string, any>;
  };
}

interface ExternalImageInfo {
  url: string;
  element?: HTMLImageElement;
}

const getExternalImages = (editor: Editor): ExternalImageInfo[] => {
  const images: ExternalImageInfo[] = [];
  const seenUrls = new Set<string>();
  
  // Get selected image first
  const selectedNode = editor.selection.getNode();
  if (selectedNode.nodeName === 'IMG') {
    const img = selectedNode as HTMLImageElement;
    if (DownloadImage.isExternalUrl(img.src) && !seenUrls.has(img.src)) {
      images.push({ url: img.src, element: img });
      seenUrls.add(img.src);
    }
  }
  
  // Get all images in editor
  const allImages = editor.dom.select('img');
  Arr.each(allImages, (img) => {
    if (DownloadImage.isExternalUrl(img.src) && !seenUrls.has(img.src)) {
      images.push({ url: img.src, element: img });
      seenUrls.add(img.src);
    }
  });
  
  return images;
};

const open = (editor: Editor): void => {
  const externalImages = getExternalImages(editor);
  
  if (externalImages.length === 0) {
    editor.windowManager.open({
      title: editor.translate('Download External Images'),
      body: {
        type: 'panel',
        items: [
          {
            type: 'alertbanner',
            level: 'info',
            text: editor.translate('No external images found in the editor. External images are images loaded from URLs (not data URIs or blob URLs).'),
            icon: 'info'
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          name: 'close',
          text: editor.translate('Close'),
          primary: true
        }
      ]
    });
    return;
  }
  
  const items = Arr.map(externalImages, (img, index) => ({
    value: String(index),
    text: img.url.length > 60 ? img.url.substring(0, 57) + '...' : img.url
  }));
  
  const initialData: DownloadDialogData = {
    src: {
      value: externalImages[0]?.url || '',
      meta: {}
    }
  };
  
  editor.windowManager.open({
    title: editor.translate('Download External Image'),
    body: {
      type: 'panel',
      items: [
        {
          type: 'alertbanner',
          level: 'warn',
          text: editor.translate(['Found {0} external images in the editor.', externalImages.length]),
          icon: 'warning'
        },
        {
          type: 'selectbox',
          name: 'imageSelect',
          label: editor.translate('Select image to download'),
          items
        },
        {
          type: 'urlinput',
          name: 'src',
          label: editor.translate('Or enter external URL'),
          filetype: 'image'
        },
        {
          type: 'htmlpanel',
          html: '<p style="font-size: 12px; color: #666; margin-top: 10px;">' +
                editor.translate('The image will be downloaded and converted to a local blob. If automatic uploads are enabled, it will be uploaded to your server.') +
                '</p>'
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        name: 'cancel',
        text: editor.translate('Cancel')
      },
      {
        type: 'submit',
        name: 'download',
        text: editor.translate('Download'),
        primary: true
      }
    ],
    initialData,
    onChange: (api, details) => {
      if (details.name === 'imageSelect') {
        const selectedIndex = parseInt(api.getData().imageSelect, 10);
        const selectedImage = externalImages[selectedIndex];
        if (selectedImage) {
          api.setData({
            src: {
              value: selectedImage.url,
              meta: {}
            }
          });
        }
      }
    },
    onSubmit: async (api) => {
      const data = api.getData();
      const url = data.src.value;
      
      if (!Strings.isNotEmpty(url)) {
        api.close();
        return;
      }
      
      api.block(editor.translate('Downloading image...'));
      
      try {
        // Find the image element if it exists
        const imgInfo = Arr.find(externalImages, (info) => info.url === url).or(
          Optional.some({ url })
        );
        
        // Create a temporary image element if needed
        let img = imgInfo.bind((info) => Optional.from(info.element)).getOrUndefined();
        
        if (!img) {
          // Create temporary image to download
          img = editor.dom.create('img', { src: url }) as HTMLImageElement;
          editor.getBody().appendChild(img);
        }
        
        await DownloadImage.downloadAndReplaceImage(editor, img);
        
        // Remove temporary image if we created one
        if (!imgInfo.bind((info) => Optional.from(info.element)).isSome()) {
          editor.dom.remove(img);
        }
        
        api.close();
        
        editor.notificationManager.open({
          text: editor.translate('Image downloaded successfully'),
          type: 'success'
        });
      } catch (err) {
        api.unblock();
        editor.notificationManager.open({
          text: editor.translate(['Failed to download image: {0}', (err as Error).message]),
          type: 'error'
        });
      }
    }
  });
};

const openMultiDownload = (editor: Editor): void => {
  const externalImages = getExternalImages(editor);

  if (externalImages.length === 0) {
    editor.notificationManager.open({
      text: editor.translate('No external images found to download'),
      type: 'info'
    });
    return;
  }

  editor.windowManager.confirm(
    editor.translate(['Download all {0} external images?', externalImages.length]),
    (state) => {
      if (state) {
        editor.execCommand('mceDownloadAllExternalImages');
      }
    }
  );
};

export {
  open,
  openMultiDownload,
  getExternalImages
};
