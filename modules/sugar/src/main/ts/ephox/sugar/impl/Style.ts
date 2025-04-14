// some elements, such as mathml, don't have style attributes
// others, such as angular elements, have style attributes that aren't a CSSStyleDeclaration
const isSupported = <T extends Node>(dom: T): dom is (T & ElementCSSInlineStyle) =>
  // eslint-disable-next-line @typescript-eslint/unbound-method
  (dom as any).style !== undefined && typeof (dom as any).style.getPropertyValue === 'function';

export { isSupported };
