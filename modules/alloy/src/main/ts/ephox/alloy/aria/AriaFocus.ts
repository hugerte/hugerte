import { Compare, Focus, PredicateFind, SugarElement, SugarShadowDom } from '@ephox/sugar';

const preserve = <T extends Node, R>(f: (e: SugarElement<T>) => R, container: SugarElement<T>): R => {
  const dos = SugarShadowDom.getRootNode(container);

  const refocus = Focus.active(dos).bind((focused): (SugarElement<HTMLElement>) | null => {
    const hasFocus = (elem: SugarElement<Node>): elem is SugarElement<HTMLElement> => Compare.eq(focused, elem);
    return hasFocus(container) ? container : PredicateFind.descendant(container, hasFocus);
  });

  const result = f(container);

  // If there is a focussed element, the F function may cause focus to be lost (such as by hiding elements). Restore it afterwards.
  refocus.each((oldFocus) => {
    Focus.active(dos).filter((newFocus) => Compare.eq(newFocus, oldFocus)).fold(() => {
      // Only refocus if the focus has changed, otherwise we break IE
      Focus.focus(oldFocus);
    }, () => {});
  });
  return result;
};

export {
  preserve
};
