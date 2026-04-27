
import Editor from '../Editor';
import DOMUtils from './DOMUtils';

type SelectorChangedCallback = (active: boolean, args: { node: Node; selector: String; parents: Node[] }) => void;

interface SelectorChanged {
  selectorChangedWithUnbind: (selector: string, callback: SelectorChangedCallback) => { unbind: () => void };
}

const deleteFromCallbackMap = (callbackMap: Record<string, SelectorChangedCallback[]>, selector: string, callback: SelectorChangedCallback) => {
  if (Object.prototype.hasOwnProperty.call(callbackMap, selector)) {
    const newCallbacks = (callbackMap[selector]).filter((cb) => cb !== callback);

    if (newCallbacks.length === 0) {
      delete callbackMap[selector];
    } else {
      callbackMap[selector] = newCallbacks;
    }
  }
};

export default (dom: DOMUtils, editor: Editor): SelectorChanged => {
  let selectorChangedData: Record<string, SelectorChangedCallback[]>;
  let currentSelectors: Record<string, SelectorChangedCallback[]>;

  const findMatchingNode = (selector: string, nodes: Node[]): (Node) | null =>
    ((nodes).find((node) => dom.is(node, selector)) ?? null);

  const getParents = (elem: Element): Node[] =>
    dom.getParents(elem, undefined, dom.getRoot());

  const setup = (): void => {
    selectorChangedData = {};
    currentSelectors = {};

    editor.on('NodeChange', (e) => {
      const node = e.element;
      const parents = getParents(node);
      const matchedSelectors: Record<string, SelectorChangedCallback[]> = {};

      // Check for new matching selectors
      Object.entries(selectorChangedData).forEach(([_k, _v]: [any, any]) => ((callbacks, selector) => {
        const matchedNode = findMatchingNode(selector, parents);
        if (matchedNode !== null) {
          if (!currentSelectors[selector]) {
            // Execute callbacks
            (callbacks as SelectorChangedCallback[]).forEach((callback) => {
              callback(true, { node: matchedNode, selector, parents });
            });

            currentSelectors[selector] = callbacks;
          }

          matchedSelectors[selector] = callbacks;
        }
      })(_v, _k));

      // Check if current selectors still match
      Object.entries(currentSelectors).forEach(([_k, _v]: [any, any]) => ((callbacks, selector) => {
        if (!matchedSelectors[selector]) {
          delete currentSelectors[selector];

          (callbacks as SelectorChangedCallback[]).forEach((callback) => {
            callback(false, { node, selector, parents });
          });
        }
      })(_v, _k));
    });
  };

  return {
    selectorChangedWithUnbind: (selector: string, callback: SelectorChangedCallback): { unbind: () => void } => {
      if (!selectorChangedData) {
        setup();
      }

      // Add selector listeners
      if (!selectorChangedData[selector]) {
        selectorChangedData[selector] = [];
      }

      selectorChangedData[selector].push(callback);

      // Setup the initial state if selected already
      if (findMatchingNode(selector, getParents(editor.selection.getStart())) !== null) {
        currentSelectors[selector] = selectorChangedData[selector];
      }

      return {
        unbind: () => {
          deleteFromCallbackMap(selectorChangedData, selector, callback);
          deleteFromCallbackMap(currentSelectors, selector, callback);
        }
      };
    }
  };
};
