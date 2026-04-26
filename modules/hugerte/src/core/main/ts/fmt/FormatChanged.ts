import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import { FormatEvent } from '../api/EventTypes';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as NodeType from '../dom/NodeType';
import { FormatVars } from './FormatTypes';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

export type FormatChangeCallback = (state: boolean, data: { node: Node; format: string; parents: Element[] }) => void;

export type RegisteredFormats = Record<string, CallbackGroup>;

export interface UnbindFormatChanged {
  unbind: () => void;
}

interface CallbackWithoutVars {
  readonly state: Cell<boolean>;
  readonly similar: boolean;
  readonly callbacks: FormatChangeCallback[];
}

interface CallbackWithVars {
  readonly state: Cell<boolean>;
  readonly similar: boolean | undefined;
  readonly vars: FormatVars;
  readonly callback: FormatChangeCallback;
}

interface CallbackGroup {
  // Batch all callbacks that don't have custom variables into one "similar=true" and one "similar=false" group
  readonly withSimilar: CallbackWithoutVars;
  readonly withoutSimilar: CallbackWithoutVars;
  // For callbacks with custom variables, handle everything separately
  readonly withVars: CallbackWithVars[];
}

const hasVars = (value: CallbackWithVars | CallbackWithoutVars): value is CallbackWithVars =>
  Object.prototype.hasOwnProperty.call(value as CallbackWithVars, 'vars');

const setup = (registeredFormatListeners: Cell<RegisteredFormats>, editor: Editor): void => {
  registeredFormatListeners.set({});

  editor.on('NodeChange', (e) => {
    updateAndFireChangeCallbacks(editor, e.element, registeredFormatListeners.get());
  });

  editor.on('FormatApply FormatRemove', (e: EditorEvent<FormatEvent>) => {
    const element = (e.node ?? null)
      .map((nodeOrRange) => FormatUtils.isNode(nodeOrRange) ? nodeOrRange : nodeOrRange.startContainer)
      .bind((node) => NodeType.isElement(node) ? node : (node.parentElement ?? null))
      .getOrThunk(() => fallbackElement(editor));

    updateAndFireChangeCallbacks(editor, element, registeredFormatListeners.get());
  });
};

const fallbackElement = (editor: Editor): Element =>
  editor.selection.getStart();

const matchingNode = (editor: Editor, parents: Element[], format: string, similar?: boolean, vars?: FormatVars): (Element) | null => {
  const isMatchingNode = (node: Element) => {
    const matchingFormat = editor.formatter.matchNode(node, format, vars ?? {}, similar);
    return !(matchingFormat) === undefined;
  };
  const isUnableToMatch = (node: Element) => {
    if (MatchFormat.matchesUnInheritedFormatSelector(editor, node, format)) {
      return true;
    } else {
      if (!similar) {
        // If we want to find an exact match, then finding a similar match halfway up the parents tree is bad
        return (editor.formatter.matchNode(node, format, vars, true)) != null;
      } else {
        return false;
      }
    }
  };
  return ((_xs: any, _pred: any, _until: any) => { for (let _i = 0; _i < _xs.length; _i++) { const _x = _xs[_i]; if (_pred(_x, _i)) return _x; if (_until(_x, _i)) break; } return null; })(parents, isMatchingNode, isUnableToMatch);
};

const getParents = (editor: Editor, elm?: Element): Element[] => {
  const element = elm ?? fallbackElement(editor);
  return (FormatUtils.getParents(editor.dom, element)).filter((node): node is Element =>
    NodeType.isElement(node) && !NodeType.isBogus(node));
};

const updateAndFireChangeCallbacks = (editor: Editor, elm: Element, registeredCallbacks: RegisteredFormats) => {
  // Ignore bogus nodes like the <a> tag created by moveStart()
  const parents = getParents(editor, elm);

  Object.entries(registeredCallbacks).forEach(([_k, _v]: [any, any]) => ((data, format) => {
    const runIfChanged = (spec: CallbackWithoutVars | CallbackWithVars) => {
      const match = matchingNode(editor, parents, format, spec.similar, hasVars(spec) ? spec.vars : undefined);
      const isSet = match !== null;
      if (spec.state.get() !== isSet) {
        spec.state.set(isSet);
        const node = match ?? (elm);
        if (hasVars(spec)) {
          spec.callback(isSet, { node, format, parents });
        } else {
          (spec.callbacks).forEach((callback) => callback(isSet, { node, format, parents }));
        }
      }
    };

    ([ data.withSimilar, data.withoutSimilar ]).forEach(runIfChanged);
    (data.withVars).forEach(runIfChanged);
  })(_v, _k));
};

const addListeners = (
  editor: Editor,
  registeredFormatListeners: Cell<RegisteredFormats>,
  formats: string,
  callback: FormatChangeCallback,
  similar?: boolean,
  vars?: FormatVars
) => {
  const formatChangeItems = registeredFormatListeners.get();

  (formats.split(',')).forEach((format) => {
    const group = ((formatChangeItems)[format] ?? null).getOrThunk(() => {
      const base: CallbackGroup = {
        withSimilar: {
          state: Cell<boolean>(false),
          similar: true,
          callbacks: []
        },
        withoutSimilar: {
          state: Cell<boolean>(false),
          similar: false,
          callbacks: []
        },
        withVars: []
      };

      formatChangeItems[format] = base;
      return base;
    });

    const getCurrent = () => {
      const parents = getParents(editor);
      return matchingNode(editor, parents, format, similar, vars) !== null;
    };
    if ((vars) === undefined) {
      const toAppendTo = similar ? group.withSimilar : group.withoutSimilar;
      toAppendTo.callbacks.push(callback);
      if (toAppendTo.callbacks.length === 1) {
        toAppendTo.state.set(getCurrent());
      }
    } else {
      group.withVars.push({
        state: Cell(getCurrent()),
        similar,
        vars,
        callback
      });
    }
  });

  registeredFormatListeners.set(formatChangeItems);
};

const removeListeners = (registeredFormatListeners: Cell<RegisteredFormats>, formats: string, callback: FormatChangeCallback) => {
  const formatChangeItems = registeredFormatListeners.get();

  (formats.split(',')).forEach((format) => ((formatChangeItems)[format] ?? null).each((group) => {
    formatChangeItems[format] = {
      withSimilar: {
        ...group.withSimilar,
        callbacks: (group.withSimilar.callbacks).filter((cb) => cb !== callback),
      },
      withoutSimilar: {
        ...group.withoutSimilar,
        callbacks: (group.withoutSimilar.callbacks).filter((cb) => cb !== callback),
      },
      withVars: (group.withVars).filter((item) => item.callback !== callback),
    };
  }));

  registeredFormatListeners.set(formatChangeItems);
};

const formatChangedInternal = (
  editor: Editor,
  registeredFormatListeners: Cell<RegisteredFormats>,
  formats: string,
  callback: FormatChangeCallback,
  similar?: boolean,
  vars?: FormatVars
): UnbindFormatChanged => {
  addListeners(editor, registeredFormatListeners, formats, callback, similar, vars);

  return {
    unbind: () => removeListeners(registeredFormatListeners, formats, callback)
  };
};

export {
  setup,
  formatChangedInternal
};
