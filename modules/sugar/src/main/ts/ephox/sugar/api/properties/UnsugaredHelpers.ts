import * as Style from '../../impl/Style';

/** Helpers we probably need even if we switch away from SugarElement completely. They must operate on Node/Element/etc. directly. */

export const cleanupStyleAttr = (element: Element): void => {
    if (Style.isSupported(element) && element.style.length === 0) {
        element.removeAttribute('style');
    }
}
export const cleanupClassAttr = (element: Element): void => {
    if (element.classList.length === 0) {
        element.removeAttribute('class');
    }
}
export const cleanupAttrs = (element: Element): void => {
    cleanupStyleAttr(element);
    cleanupClassAttr(element);
}
