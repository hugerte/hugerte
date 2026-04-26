
import Editor from 'hugerte/core/api/Editor';
import { FormatReference, Separator, StyleFormat } from 'hugerte/core/api/fmt/StyleFormat';

import { FormatItem, FormatterFormatItem, PreviewSpec, SelectedFormat, SubMenuFormatItem } from '../BespokeSelect';
import { isFormatReference, isNestedFormat, NestedStyleFormat, StyleFormatType } from '../StyleFormat';

export type IsSelectedForType = (format: string) => (currentValue: (SelectedFormat) | null) => boolean;
export type GetPreviewForType = (format: string) => () => (PreviewSpec) | null;

const isSeparator = (format: StyleFormatType): format is Separator => {
  const keys = Object.keys(format);
  return keys.length === 1 && (keys).includes('title');
};

const processBasic = (item: FormatReference, isSelectedFor: IsSelectedForType, getPreviewFor: GetPreviewForType): FormatterFormatItem => ({
  ...item,
  type: 'formatter' as const,
  isSelected: isSelectedFor(item.format),
  getStylePreview: getPreviewFor(item.format)
});

// TODO: This is adapted from StyleFormats in the mobile theme. Consolidate.
const register = (editor: Editor, formats: StyleFormatType[], isSelectedFor: IsSelectedForType, getPreviewFor: GetPreviewForType): FormatItem[] => {
  const enrichSupported = (item: FormatReference): FormatterFormatItem => processBasic(item, isSelectedFor, getPreviewFor);

  // Item that triggers a submenu
  const enrichMenu = (item: NestedStyleFormat): SubMenuFormatItem => {
    const newItems = doEnrich(item.items);
    return {
      ...item,
      type: 'submenu' as const,
      getStyleItems: () => newItems
    };
  };

  const enrichCustom = (item: StyleFormat): FormatterFormatItem => {
    const formatName = typeof (item.name) === 'string' ? item.name : ((item.title) + '_' + Math.floor(Math.random() * 1e9) + Date.now());
    const formatNameWithPrefix = `custom-${formatName}`;

    const newItem = {
      ...item,
      type: 'formatter' as const,
      format: formatNameWithPrefix,
      isSelected: isSelectedFor(formatNameWithPrefix),
      getStylePreview: getPreviewFor(formatNameWithPrefix)
    };
    editor.formatter.register(formatName, newItem);
    return newItem;
  };

  const doEnrich = (items: StyleFormatType[]): FormatItem[] => (items).map((item) => {
    // If it is a submenu, enrich all the subitems.
    if (isNestedFormat(item)) {
      return enrichMenu(item);
    } else if (isFormatReference(item)) {
      return enrichSupported(item);
    // NOTE: This branch is added from the original StyleFormats in mobile
    } else if (isSeparator(item)) {
      return { ...item, type: 'separator' as const };
    } else {
      return enrichCustom(item);
    }
  });

  return doEnrich(formats);
};

export {
  processBasic,
  register
};
