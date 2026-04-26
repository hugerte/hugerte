import { Transformations } from '@ephox/acid';
import { TableLookup, TableOperations } from '@ephox/snooker';
import { Css, SugarElement, SugarElements } from '@ephox/sugar';

import DOMUtils from 'hugerte/core/api/dom/DOMUtils';
import Editor from 'hugerte/core/api/Editor';

import * as Styles from '../actions/Styles';
import * as Options from '../api/Options';
import * as Utils from '../core/Utils';

/**
 * @class hugerte.table.ui.Helpers
 * @private
 */

interface AdvancedStyles {
  readonly borderwidth: string;
  readonly borderstyle: string;
  readonly bordercolor: string;
  readonly backgroundcolor: string;
}

// Note: Need to use a types here, as types are iterable whereas interfaces are not
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type TableData = {
  readonly height: string;
  readonly width: string;
  readonly cellspacing: string;
  readonly cellpadding: string;
  readonly caption: boolean;
  readonly align: string;
  readonly border: string;
  class?: string;
  cols?: string;
  rows?: string;
  borderstyle?: string;
  bordercolor?: string;
  backgroundcolor?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type RowData = {
  readonly height: string;
  readonly class: string;
  readonly align: string;
  readonly type: string;
  readonly borderstyle?: string;
  readonly bordercolor?: string;
  readonly backgroundcolor?: string;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CellData = {
  readonly width: string;
  readonly scope: string;
  readonly celltype: 'td' | 'th';
  readonly class: string;
  readonly halign: string;
  readonly valign: string;
  readonly borderwidth?: string;
  readonly borderstyle?: string;
  readonly bordercolor?: string;
  readonly backgroundcolor?: string;
};

const rgbToHex = (value: string): string =>
  (value).startsWith('rgb') ? Transformations.rgbaToHexString(value) : value;

const extractAdvancedStyles = (elm: Node): AdvancedStyles => {
  const element = SugarElement.fromDom(elm);
  return {
    borderwidth: Css.getRaw(element, 'border-width') ?? (''),
    borderstyle: Css.getRaw(element, 'border-style') ?? (''),
    bordercolor: Css.getRaw(element, 'border-color').map(rgbToHex) ?? (''),
    backgroundcolor: Css.getRaw(element, 'background-color').map(rgbToHex) ?? ('')
  };
};

const getSharedValues = <T extends Record<string, string>>(data: T[]): T => {
  // TODO surely there's a better way to do this??
  // Mutates baseData to return an object that contains only the values
  // that were the same across all objects in data
  const baseData: Record<string, string> = data[0];
  const comparisonData = data.slice(1);

  (comparisonData).forEach((items) => {
    (Object.keys(baseData)).forEach((key) => {
      Object.entries(items).forEach(([_k, _v]: [any, any]) => ((itemValue, itemKey) => {
        const comparisonValue = baseData[key];
        if (comparisonValue !== '' && key === itemKey) {
          if (comparisonValue !== itemValue) {
            baseData[key] = key === 'class' ? 'mce-no-match' : '';
          }
        }
      })(_v, _k));
    });
  });

  return baseData as T;
};

// The extractDataFrom... functions are in this file partly for code reuse and partly so we can test them,
// because some of these are crazy complicated

const getAlignment = (formats: string[], formatName: string, editor: Editor, elm: Node): string =>
  ((formats).find((name) => !(editor.formatter.matchNode(elm, formatName + name)) === undefined) ?? null) ?? ('');
const getHAlignment = ((..._rest: any[]) => (getAlignment)([ 'left', 'center', 'right' ], 'align', ..._rest));
const getVAlignment = ((..._rest: any[]) => (getAlignment)([ 'top', 'middle', 'bottom' ], 'valign', ..._rest));

const extractDataFromSettings = (editor: Editor, hasAdvTableTab: boolean): TableData => {
  const style = Options.getDefaultStyles(editor);
  const attrs = Options.getDefaultAttributes(editor);

  const extractAdvancedStyleData = () => ({
    borderstyle: ((style)['border-style'] ?? null) ?? (''),
    bordercolor: rgbToHex(((style)['border-color'] ?? null) ?? ('')),
    backgroundcolor: rgbToHex(((style)['background-color'] ?? null) ?? (''))
  });

  const defaultData: TableData = {
    height: '',
    width: '100%',
    cellspacing: '',
    cellpadding: '',
    caption: false,
    class: '',
    align: '',
    border: ''
  };

  const getBorder = () => {
    const borderWidth = style['border-width'];
    if (Options.shouldStyleWithCss(editor) && borderWidth) {
      return { border: borderWidth };
    }
    return ((attrs)['border'] ?? null).fold(() => ({}), (border) => ({ border }));
  };

  const advStyle = (hasAdvTableTab ? extractAdvancedStyleData() : {});

  const getCellPaddingCellSpacing = () => {
    const spacing = ((style)['border-spacing'] ?? null).or(((attrs)['cellspacing'] ?? null)).fold( () => ({}), (cellspacing) => ({ cellspacing }));
    const padding = ((style)['border-padding'] ?? null).or(((attrs)['cellpadding'] ?? null)).fold( () => ({}), (cellpadding) => ({ cellpadding }));
    return {
      ...spacing,
      ...padding
    };
  };

  const data = {
    ...defaultData,
    ...style,
    ...attrs,
    ...advStyle,
    ...getBorder(),
    ...getCellPaddingCellSpacing()
  };
  return data;
};

const getRowType = (elm: HTMLTableRowElement) =>
  TableLookup.table(SugarElement.fromDom(elm)).map((table) => {
    const target = { selection: SugarElements.fromDom(elm.cells) };
    return TableOperations.getRowsType(table, target);
  }) ?? ('');

const extractDataFromTableElement = (editor: Editor, elm: Element, hasAdvTableTab: boolean): TableData => {
  const getBorder = (dom: DOMUtils, elm: Element) => {
    // Cases (in order to check):
    // 1. shouldStyleWithCss - extract border-width style if it exists
    // 2. !shouldStyleWithCss && border attribute - set border attribute as value
    // 3. !shouldStyleWithCss && nothing on the table - grab styles from the first th or td

    const optBorderWidth = Css.getRaw(SugarElement.fromDom(elm), 'border-width');
    if (Options.shouldStyleWithCss(editor) && optBorderWidth !== null) {
      return optBorderWidth ?? ('');
    }
    return dom.getAttrib(elm, 'border') || Styles.getTDTHOverallStyle(editor.dom, elm, 'border-width')
      || Styles.getTDTHOverallStyle(editor.dom, elm, 'border') || '';
  };

  const dom = editor.dom;

  const cellspacing = Options.shouldStyleWithCss(editor) ?
    dom.getStyle(elm, 'border-spacing') || dom.getAttrib(elm, 'cellspacing') :
    dom.getAttrib(elm, 'cellspacing') || dom.getStyle(elm, 'border-spacing');

  const cellpadding = Options.shouldStyleWithCss(editor) ?
    Styles.getTDTHOverallStyle(dom, elm, 'padding') || dom.getAttrib(elm, 'cellpadding') :
    dom.getAttrib(elm, 'cellpadding') || Styles.getTDTHOverallStyle(dom, elm, 'padding');

  return {
    width: dom.getStyle(elm, 'width') || dom.getAttrib(elm, 'width'),
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    cellspacing: cellspacing ?? '',
    cellpadding: cellpadding ?? '',
    border: getBorder(dom, elm),
    caption: !!dom.select('caption', elm)[0],
    class: dom.getAttrib(elm, 'class', ''),
    align: getHAlignment(editor, elm),
    ...(hasAdvTableTab ? extractAdvancedStyles(elm) : {})
  };
};

const extractDataFromRowElement = (editor: Editor, elm: HTMLTableRowElement, hasAdvancedRowTab: boolean): RowData => {
  const dom = editor.dom;
  return {
    height: dom.getStyle(elm, 'height') || dom.getAttrib(elm, 'height'),
    class: dom.getAttrib(elm, 'class', ''),
    type: getRowType(elm),
    align: getHAlignment(editor, elm),
    ...(hasAdvancedRowTab ? extractAdvancedStyles(elm) : {})
  };
};

const extractDataFromCellElement = (editor: Editor, cell: HTMLTableCellElement, hasAdvancedCellTab: boolean, column: (HTMLTableColElement) | null): CellData => {
  const dom = editor.dom;
  const colElm = column ?? (cell);

  const getStyle = (element: HTMLElement, style: string) => dom.getStyle(element, style) || dom.getAttrib(element, style);

  return {
    width: getStyle(colElm, 'width'),
    scope: dom.getAttrib(cell, 'scope'),
    celltype: Utils.getNodeName(cell) as 'td' | 'th',
    class: dom.getAttrib(cell, 'class', ''),
    halign: getHAlignment(editor, cell),
    valign: getVAlignment(editor, cell),
    ...(hasAdvancedCellTab ? extractAdvancedStyles(cell) : {})
  };
};

export {
  extractAdvancedStyles,
  getSharedValues,
  extractDataFromTableElement,
  extractDataFromRowElement,
  extractDataFromCellElement,
  extractDataFromSettings
};

