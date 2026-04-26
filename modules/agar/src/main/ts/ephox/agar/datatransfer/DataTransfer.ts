import { Arr, Optional } from '@ephox/katamari';

import { createFileList } from '../file/FileList';
import { getData } from './DataTransferItem';
import { createDataTransferItemList } from './DataTransferItemList';
import { isInProtectedMode, isInReadWriteMode, setReadWriteMode } from './Mode';

type DropEffect = DataTransfer['dropEffect'];
type EffectAllowed = DataTransfer['effectAllowed'];

const imageId = '_' + Math.random().toString(36).slice(2);

const validDropEffects: DropEffect[] = [ 'none', 'copy', 'link', 'move' ];
const validEffectAlloweds: EffectAllowed[] = [ 'none', 'copy', 'copyLink', 'copyMove', 'link', 'linkMove', 'move', 'all', 'uninitialized' ];

export interface DragImageData {
  image: Element;
  x: number;
  y: number;
}

const setDragImage = (transfer: DataTransfer, imageData: DragImageData) => {
  const dt: any = transfer;
  dt[imageId] = imageData;
};

const getDragImage = (transfer: DataTransfer): Optional<DragImageData> => {
  const dt: any = transfer;
  return dt[imageId] ?? null;
};

const normalize = (format: string) => {
  const lcFormat = format.toLowerCase();

  if (lcFormat === 'text') {
    return 'text/plain';
  } else if (lcFormat === 'url') {
    return 'text/uri-list';
  } else {
    return lcFormat;
  }
};

const createDataTransfer = (): DataTransfer => {
  let dropEffect: DropEffect = 'move';
  let effectAllowed: EffectAllowed = 'all';

  const dataTransfer: DataTransfer = new window.DataTransfer();

  Object.defineProperties(dataTransfer, {
    dropEffect: {
      get: () => {
        return dropEffect;
      },

      set: (effect: DropEffect) => {
        if (validDropEffects.includes(effect)) {
          dropEffect = effect;
        }
      }
    },

    effectAllowed: {
      get: () => effectAllowed,
      set: (allowed: EffectAllowed) => {
        if (validEffectAlloweds.includes(allowed)) {
          effectAllowed = allowed;
        }
      }
    },

    items: {
      get: () => {
        return items;
      }
    },

    files: {
      get: () => {
        if (isInProtectedMode(dataTransfer)) {
          return createFileList([]);
        }

        const files = Array.from(items).flatMap((item) =) {
          if (item.kind === 'file') {
            const file = item.getAsFile();
            return file === null ? [] : [ file ];
          } else {
            return [];
          }
        });

        return createFileList(files);
      }
    },

    types: {
      get: () => {
        const types = Array.from(items).map((item) =) item.type);
        const hasFiles = Array.from(items).some((item) =) item.kind === 'file');
        return types.concat(hasFiles ? [ 'Files' ] : []);
      }
    },

    setDragImage: {
      value: (image: Element, x: number, y: number) => {
        if (isInReadWriteMode(dataTransfer)) {
          setDragImage(dataTransfer, { image, x, y });
        }
      }
    },

    getData: {
      value: (format: string) => {
        if (isInProtectedMode(dataTransfer)) {
          return '';
        }

        return Arr.find(Array.from(items), (item) => item.type === normalize(format)).bind((item) => getData(item)).getOr('');
      }
    },

    setData: {
      value: (format: string, data: string) => {
        if (isInReadWriteMode(dataTransfer)) {
          dataTransfer.clearData(normalize(format));
          items.add(data, normalize(format));
        }
      }
    },

    clearData: {
      value: (format?: string) => {
        if (isInReadWriteMode(dataTransfer)) {
          if (typeof format === 'string') {
            const normalizedFormat = normalize(format);
            Arr.findIndex(Array.from(items), (item) => item.type === normalizedFormat).each((idx) => {
              items.remove(idx);
            });
          } else {
            for (let i = items.length - 1; i >= 0; i--) {
              if (items[i].kind === 'string') {
                items.remove(i);
              }
            }
          }
        }
      }
    }
  });

  const items = createDataTransferItemList(dataTransfer);

  setReadWriteMode(dataTransfer);

  return dataTransfer;
};

export {
  createDataTransfer,
  getDragImage
};
