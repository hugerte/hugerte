
import { BlobCache, BlobInfo } from '../api/file/BlobCache';
import * as Conversions from './Conversions';

let count = 0;

const uniqueId = (prefix?: string): string => {
  return (prefix || 'blobid') + (count++);
};

const processDataUri = (dataUri: string, base64Only: boolean, generateBlobInfo: (base64: string, type: string) => (BlobInfo) | null): (BlobInfo) | null => {
  return Conversions.parseDataUri(dataUri).bind(({ data, type, base64Encoded }) => {
    if (base64Only && !base64Encoded) {
      return null;
    } else {
      const base64 = base64Encoded ? data : btoa(data);
      return generateBlobInfo(base64, type);
    }
  });
};

const createBlobInfo = (blobCache: BlobCache, blob: Blob, base64: string) => {
  const blobInfo = blobCache.create(uniqueId(), blob, base64);
  blobCache.add(blobInfo);
  return blobInfo;
};

export const dataUriToBlobInfo = (blobCache: BlobCache, dataUri: string, base64Only: boolean = false): (BlobInfo) | null => {
  return processDataUri(dataUri, base64Only, (base64, type) =>
    (blobCache.getByData(base64, type) ?? null).orThunk(() =>
      Conversions.buildBlob(type, base64).map((blob) =>
        createBlobInfo(blobCache, blob, base64)
      )
    )
  );
};

export const imageToBlobInfo = (blobCache: BlobCache, imageSrc: string): Promise<BlobInfo> => {
  const invalidDataUri = () => Promise.reject('Invalid data URI');

  if ((imageSrc).startsWith('blob:')) {
    const blobInfo = blobCache.getByUri(imageSrc);

    if ((blobInfo) != null) {
      return Promise.resolve(blobInfo);
    } else {
      return Conversions.uriToBlob(imageSrc).then((blob) => {
        return Conversions.blobToDataUri(blob).then((dataUri) => {
          return processDataUri(dataUri, false, (base64) => {
            return createBlobInfo(blobCache, blob, base64);
          }).getOrThunk(invalidDataUri);
        });
      });
    }
  } else if ((imageSrc).startsWith('data:')) {
    return dataUriToBlobInfo(blobCache, imageSrc).fold(
      invalidDataUri,
      (blobInfo) => Promise.resolve(blobInfo)
    );
  } else {
    // Not a blob or data URI so the image isn't a local image and isn't something that can be processed
    return Promise.reject('Unknown image data format');
  }
};
