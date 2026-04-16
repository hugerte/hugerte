import { Arr } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';
import { BlobCache, BlobInfo } from 'hugerte/core/api/file/BlobCache';

let counter = 0;

const createId = (): string =>
  'mcedownloadedimage-' + (new Date()).getTime() + '-' + (++counter);

const extractFilename = (url: string): string =>
  url.replace(/[?#].*/, '').replace(/.*\//, '');

const createBlobInfo = (blobCache: BlobCache, image: HTMLImageElement, blob: Blob): Promise<BlobInfo> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      const existingBlobInfo = blobCache.getByData(base64, blob.type);
      if (existingBlobInfo) {
        resolve(existingBlobInfo);
      } else {
        const name = extractFilename(image.src);
        const blobInfo = blobCache.create(createId(), blob, base64, name !== '' ? name : undefined);
        blobCache.add(blobInfo);
        resolve(blobInfo);
      }
    };
    reader.onerror = () => reject(reader.error?.message ?? 'Failed to read blob');
    reader.readAsDataURL(blob);
  });

const isExternalUrl = (src: string): boolean =>
  /^https?:\/\//i.test(src) || /^\/\//.test(src);

const resolveUrl = (src: string): string =>
  src.startsWith('//') ? window.location.protocol + src : src;

const downloadImage = (blobCache: BlobCache, image: HTMLImageElement): Promise<BlobInfo> =>
  fetch(resolveUrl(image.src))
    .then((response) => {
      if (!response.ok) {
        return Promise.reject(`Failed to fetch image: ${image.src} (${response.status} ${response.statusText})`);
      }
      return response.blob();
    })
    .then((blob) => createBlobInfo(blobCache, image, blob));

const findExternalImages = (editor: Editor): HTMLImageElement[] => {
  const images = editor.dom.select<HTMLImageElement>('img');
  return Arr.filter(images, (image) => {
    const src = image.getAttribute('data-mce-src') || image.src;
    return isExternalUrl(src);
  });
};

const downloadAndReplaceImages = (editor: Editor): Promise<void> => {
  const blobCache = editor.editorUpload.blobCache;
  const images = findExternalImages(editor);

  if (images.length === 0) {
    return Promise.resolve();
  }

  const downloadPromises = Arr.map(images, (image) =>
    downloadImage(blobCache, image).then((blobInfo) => ({ image, blobInfo }))
  );

  return Promise.allSettled(downloadPromises).then((results) => {
    editor.undoManager.transact(() => {
      Arr.each(results, (result) => {
        if (result.status === 'fulfilled') {
          const { image, blobInfo } = result.value;
          image.src = blobInfo.blobUri();
          image.removeAttribute('data-mce-src');
        } else {
          const message = typeof result.reason === 'string' ? result.reason :
            (result.reason instanceof Error ? result.reason.message : 'Unknown error');
          editor.notificationManager.open({ type: 'error', text: message });
        }
      });
    });

    if (editor.options.get('automatic_uploads')) {
      editor.editorUpload.uploadImages();
    }
  });
};

export {
  downloadAndReplaceImages,
  findExternalImages
};
