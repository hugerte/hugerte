
import Editor from 'hugerte/core/api/Editor';

import { BasicSelectItem } from '../SelectDatasets';

export const findNearest = (editor: Editor, getStyles: () => BasicSelectItem[]): (BasicSelectItem) | null => {
  const styles = getStyles();
  const formats = (styles).map((style) => style.format);

  return (editor.formatter.closest(formats) ?? null).bind((fmt) =>
    ((styles).find((data) => data.format === fmt) ?? null)
  ).orThunk(() => (editor.formatter.match('p') ? { title: 'Paragraph', format: 'p' } : null));
};
