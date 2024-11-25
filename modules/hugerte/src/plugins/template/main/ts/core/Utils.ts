import { Arr, Obj } from "@hugerte/katamari";

import DOMUtils from 'hugerte/core/api/dom/DOMUtils';
import Editor from 'hugerte/core/api/Editor';
import HtmlSerializer from 'hugerte/core/api/html/Serializer';

const entitiesAttr: Record<string, string> = {
  '"': '&quot;',
  '<': '&lt;',
  '>': '&gt;',
  '&': '&amp;',
  '\'': '&#039;'
};

const htmlEscape = (html: string): string =>
  html.replace(/["'<>&]/g, (match) => Obj.get(entitiesAttr, match).getOr(match));

const hasAnyClasses = (dom: DOMUtils, n: Element, classes: string): boolean =>
  Arr.exists(classes.split(/\s+/), (c) => dom.hasClass(n, c));

const parseAndSerialize = (editor: Editor, html: string): string =>
  HtmlSerializer({ validate: true }, editor.schema).serialize(
    editor.parser.parse(html, { insert: true })
  );

export {
  hasAnyClasses,
  htmlEscape,
  parseAndSerialize
};
