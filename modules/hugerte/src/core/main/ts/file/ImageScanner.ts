
import Env from '../api/Env';
import { BlobCache, BlobInfo } from '../api/file/BlobCache';
import { imageToBlobInfo } from './BlobCacheUtils';
import { UploadStatus } from './UploadStatus';

export interface BlobInfoImagePair {
  image: HTMLImageElement;
  blobInfo: BlobInfo;
}

export interface BlobUriError {
  uriType: 'blob';
  message: string;
}

export interface ImageScanner {
  findAll: (elm: HTMLElement, predicate?: (img: HTMLImageElement) => boolean) => Promise<Array<BlobInfoImagePair | string | BlobUriError>>;
}

/**
 * Finds images with data uris or blob uris. If data uris are found it will convert them into blob uris.
 *
 * @private
 * @class hugerte.file.ImageScanner
 */

const getAllImages = (elm: HTMLElement): HTMLImageElement[] => {
  return elm ? Array.from(elm.getElementsByTagName('img')) : [];
};

export const ImageScanner = (uploadStatus: UploadStatus, blobCache: BlobCache): ImageScanner => {
  const cachedPromises: Record<string, Promise<BlobInfoImagePair>> = {};

  const findAll = (elm: HTMLElement, predicate: (img: HTMLImageElement) => boolean = (() => true as const)) => {
    const images = (getAllImages(elm)).filter((img) => {
      const src = img.src;

      if (img.hasAttribute('data-mce-bogus')) {
        return false;
      }

      if (img.hasAttribute('data-mce-placeholder')) {
        return false;
      }

      if (!src || src === Env.transparentSrc) {
        return false;
      }

      if ((src).startsWith('blob:')) {
        return !uploadStatus.isUploaded(src) && predicate(img);
      }

      if ((src).startsWith('data:')) {
        return predicate(img);
      }

      return false;
    });

    const promises = (images).map((img): Promise<BlobInfoImagePair> => {
      const imageSrc = img.src;

      if (Object.prototype.hasOwnProperty.call(cachedPromises, imageSrc)) {
        // Since the cached promise will return the cached image
        // We need to wrap it and resolve with the actual image
        return cachedPromises[imageSrc].then((imageInfo) => {
          if (typeof (imageInfo) === 'string') { // error apparently
            return imageInfo;
          } else {
            return {
              image: img,
              blobInfo: imageInfo.blobInfo
            };
          }
        });
      } else {
        const newPromise = imageToBlobInfo(blobCache, imageSrc)
          .then((blobInfo) => {
            delete cachedPromises[imageSrc];
            return { image: img, blobInfo };
          }).catch((error) => {
            delete cachedPromises[imageSrc];
            return error;
          });

        cachedPromises[imageSrc] = newPromise;

        return newPromise;
      }
    });

    return Promise.all(promises);
  };

  return {
    findAll
  };
};
