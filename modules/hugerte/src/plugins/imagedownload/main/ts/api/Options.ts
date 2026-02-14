import Editor from 'hugerte/core/api/Editor';
import { Type } from '@ephox/katamari';

interface ImageDownloadOptions {
  readonly allowedDomains?: string[];
  readonly maxFileSize?: number;
  readonly convertToDataUri?: boolean;
}

const optionName = 'image_download_options';

const register = (editor: Editor): void => {
  const registerOption = editor.options.register;

  registerOption(optionName, {
    processor: (value) => Type.isObject(value),
    default: {
      allowedDomains: [],
      maxFileSize: 10 * 1024 * 1024, // 10MB default
      convertToDataUri: false
    }
  });
};

const getImageDownloadOptions = (editor: Editor): ImageDownloadOptions => {
  return editor.options.get(optionName) as ImageDownloadOptions;
};

export {
  register,
  getImageDownloadOptions
};
