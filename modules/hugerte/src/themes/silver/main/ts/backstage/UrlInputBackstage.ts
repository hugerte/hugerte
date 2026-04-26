import { Future } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';
import { FilePickerCallback, FilePickerValidationCallback } from 'hugerte/core/api/OptionTypes';
import Tools from 'hugerte/core/api/util/Tools';

import * as Options from '../api/Options';
import { LinkTarget, LinkTargets } from '../ui/core/LinkTargets';
import { addToHistory, getHistory } from './UrlInputHistory';

export interface LinkInformation {
  readonly targets: LinkTarget[];
  readonly anchorTop?: string;
  readonly anchorBottom?: string;
}

export interface ApiUrlData {
  readonly value: string;
  readonly meta?: Record<string, any>;
}

export interface InternalUrlData extends ApiUrlData {
  readonly fieldname: string;
}

export type UrlPicker = (entry: InternalUrlData) => Future<ApiUrlData>;

export interface UiFactoryBackstageForUrlInput {
  readonly getHistory: (fileType: string) => string[];
  readonly addToHistory: (url: string, fileType: string) => void;
  readonly getLinkInformation: () => (LinkInformation) | null;
  readonly getValidationHandler: () => (FilePickerValidationCallback) | null;
  readonly getUrlPicker: (filetype: string) => (UrlPicker) | null;
}

const isTruthy = (value: any) => !!value;

const makeMap = (value: string): Record<string, boolean> =>
  Object.fromEntries(Object.entries(Tools.makeMap(value, /[, ]/)).map(([_k, _v]: [any, any]) => [_k, (isTruthy)(_v, _k as any)]));

const getPicker = (editor: Editor): (FilePickerCallback) | null =>
  (Options.getFilePickerCallback(editor) ?? null);

const getPickerTypes = (editor: Editor): boolean | Record<string, boolean> => {
  const optFileTypes = (Options.getFilePickerTypes(editor) ?? null).filter(isTruthy).map(makeMap);
  return getPicker(editor).fold(
    (() => false as const),
    (_picker) => optFileTypes.fold<boolean | Record<string, boolean>>(
      (() => true as const),
      (types) => Object.keys(types).length > 0 ? types : false)
  );
};

const getPickerSetting = (editor: Editor, filetype: string): (FilePickerCallback) | null => {
  const pickerTypes = getPickerTypes(editor);
  if (typeof (pickerTypes) === 'boolean') {
    return pickerTypes ? getPicker(editor) : null;
  } else {
    return pickerTypes[filetype] ? getPicker(editor) : null;
  }
};

const getUrlPicker = (editor: Editor, filetype: string): (UrlPicker) | null => getPickerSetting(editor, filetype).map((picker) => (entry: InternalUrlData): Future<ApiUrlData> => Future.nu((completer) => {
  const handler = (value: string, meta?: Record<string, any>) => {
    if (!typeof (value) === 'string') {
      throw new Error('Expected value to be string');
    }
    if (meta !== undefined && !(typeof (meta) === 'object' && (meta) !== null)) {
      throw new Error('Expected meta to be a object');
    }
    const r: ApiUrlData = { value, meta };
    completer(r);
  };
  const meta = {
    filetype,
    fieldname: entry.fieldname,
    ...(entry.meta ?? null) ?? ({})
  };
  // file_picker_callback(callback, currentValue, metaData)
  picker.call(editor, handler, entry.value, meta);
}));

const getTextSetting = (value: string | boolean): string | undefined =>
  (value ?? null).filter((x: any): x is string => typeof x === 'string') ?? undefined;

export const getLinkInformation = (editor: Editor): (LinkInformation) | null => {
  if (!Options.useTypeaheadUrls(editor)) {
    return null;
  }

  return {
    targets: LinkTargets.find(editor.getBody()),
    anchorTop: getTextSetting(Options.getAnchorTop(editor)),
    anchorBottom: getTextSetting(Options.getAnchorBottom(editor))
  };
};
export const getValidationHandler = (editor: Editor): (FilePickerValidationCallback) | null =>
  (Options.getFilePickerValidatorHandler(editor) ?? null);

export const UrlInputBackstage = (editor: Editor): UiFactoryBackstageForUrlInput => ({
  getHistory,
  addToHistory,
  getLinkInformation: () => getLinkInformation(editor),
  getValidationHandler: () => getValidationHandler(editor),
  getUrlPicker: (filetype: string) => getUrlPicker(editor, filetype)
});
