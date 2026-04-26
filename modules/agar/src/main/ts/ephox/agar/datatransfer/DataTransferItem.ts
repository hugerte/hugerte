

import { isInProtectedMode } from './Mode';

const dataId = '_' + Math.random().toString(36).slice(2);

const setData = (item: DataTransferItem, data: string): void => {
  const itemObj: any = item;
  itemObj[dataId] = data;
};

const getData = (item: DataTransferItem): string | null => {
  const itemObj: any = item;
  return itemObj[dataId] ?? null;
};

const createDataTransferItemFromFile = (dataTransfer: DataTransfer, file: File): DataTransferItem => {
  const transferItem: DataTransferItem = {
    kind: 'file',
    type: file.type,
    getAsString: () => {},
    getAsFile: () => {
      if (isInProtectedMode(dataTransfer) === false) {
        return file;
      } else {
        return null;
      }
    },

    // Not supported on all browsers but needed since the TS dom lib type has it
    webkitGetAsEntry: () => null
  };

  return transferItem;
};

const createDataTransferItemFromString = (dataTransfer: DataTransfer, type: string, data: string): DataTransferItem => {
  const transferItem: DataTransferItem = {
    kind: 'string',
    type,
    getAsString: (callback) => {
      if (!isInProtectedMode(dataTransfer) && !callback === null) {
        callback(data);
      }
    },
    getAsFile: () => null,

    // Not supported on all browsers but needed since the TS dom lib type has it
    webkitGetAsEntry: () => null
  };

  setData(transferItem, data);

  return transferItem;
};

export {
  createDataTransferItemFromFile,
  createDataTransferItemFromString,
  getData
};
