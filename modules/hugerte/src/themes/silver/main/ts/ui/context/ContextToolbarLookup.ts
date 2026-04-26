import { InlineContent } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';
import { Compare, SugarElement, SugarNode, TransformFind } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';

import { ContextType } from './ContextToolbar';
import { ScopedToolbars } from './ContextToolbarScopes';

export interface LookupResult {
  readonly toolbars: ContextType[];
  readonly elem: SugarElement<Element>;
}

interface MatchResult {
  readonly contextToolbars: InlineContent.ContextToolbar[];
  readonly contextForms: InlineContent.ContextForm[];
}

const matchTargetWith = (elem: SugarElement<Element>, candidates: ContextType[]): MatchResult => {
  const ctxs = (candidates).filter((toolbarApi) => toolbarApi.predicate(elem.dom));
  // TODO: somehow type this properly (Arr.partition can't)
  // e.g. here pass is Toolbar.ContextToolbar and fail is Toolbar.ContextForm
  const { pass, fail } = (ctxs).reduce((acc: { pass: any[], fail: any[] }, x: any, i: number) => { (((t) => t.type === 'contexttoolbar')(x, i) ? acc.pass : acc.fail).push(x); return acc; }, { pass: [], fail: [] });
  return {
    contextToolbars: pass as InlineContent.ContextToolbar[],
    contextForms: fail as InlineContent.ContextForm[]
  };
};

const filterByPositionForStartNode = (toolbars: ContextType[]): ContextType[] => {
  if (toolbars.length <= 1) {
    return toolbars;
  } else {
    const doesPositionExist = (value: string) => (toolbars).some((t) => t.position === value);
    const filterToolbarsByPosition = (value: string) => (toolbars).filter((t) => t.position === value);

    const hasSelectionToolbars = doesPositionExist('selection');
    const hasNodeToolbars = doesPositionExist('node');
    if (hasSelectionToolbars || hasNodeToolbars) {
      if (hasNodeToolbars && hasSelectionToolbars) {
        // if there's a mix, change the 'selection' toolbars to 'node' so there's no positioning confusion
        const nodeToolbars = filterToolbarsByPosition('node');
        const selectionToolbars = filterToolbarsByPosition('selection').map((t) => ({ ...t, position: 'node' }));
        return nodeToolbars.concat(selectionToolbars);
      } else {
        return hasSelectionToolbars ? filterToolbarsByPosition('selection') : filterToolbarsByPosition('node');
      }
    } else {
      return filterToolbarsByPosition('line');
    }
  }
};

const filterByPositionForAncestorNode = (toolbars: ContextType[]): ContextType[] => {
  if (toolbars.length <= 1) {
    return toolbars;
  } else {
    const findPosition = (value: string) => ((toolbars).find((t) => t.position === value) ?? null);

    // prioritise position by 'selection' -> 'node' -> 'line'
    const basePosition = findPosition('selection')
      .orThunk(() => findPosition('node'))
      .orThunk(() => findPosition('line'))
      .map((t) => t.position);
    return basePosition.fold(
      () => [],
      (pos) => (toolbars).filter((t) => t.position === pos)
    );
  }
};

const matchStartNode = (elem: SugarElement<Element>, nodeCandidates: ContextType[], editorCandidates: ContextType[]): (LookupResult) | null => {
  // requirements:
  // 1. prioritise context forms over context menus
  // 2. prioritise node scoped over editor scoped context forms
  // 3. only show max 1 context form
  // 4. concatenate all available context toolbars if no context form

  const nodeMatches = matchTargetWith(elem, nodeCandidates);

  if (nodeMatches.contextForms.length > 0) {
    return { elem, toolbars: [ nodeMatches.contextForms[0] ] };
  } else {
    const editorMatches = matchTargetWith(elem, editorCandidates);

    if (editorMatches.contextForms.length > 0) {
      return { elem, toolbars: [ editorMatches.contextForms[0] ] };
    } else if (nodeMatches.contextToolbars.length > 0 || editorMatches.contextToolbars.length > 0) {
      const toolbars = filterByPositionForStartNode(nodeMatches.contextToolbars.concat(editorMatches.contextToolbars));
      return { elem, toolbars };
    } else {
      return null;
    }
  }
};

const matchAncestor = (isRoot: (elem: SugarElement<Node>) => boolean, startNode: SugarElement<Element>, scopes: ScopedToolbars): (LookupResult) | null => {
  // Don't continue to traverse if the start node is the root node
  if (isRoot(startNode)) {
    return null;
  } else {
    return TransformFind.ancestor(startNode, (ancestorElem) => {
      if (SugarNode.isElement(ancestorElem)) {
        const { contextToolbars, contextForms } = matchTargetWith(ancestorElem, scopes.inNodeScope);
        const toolbars = contextForms.length > 0 ? contextForms : filterByPositionForAncestorNode(contextToolbars);
        return toolbars.length > 0 ? { elem: ancestorElem, toolbars } : null;
      } else {
        return null;
      }
    }, isRoot);
  }
};

const lookup = (scopes: ScopedToolbars, editor: Editor): (LookupResult) | null => {
  const rootElem = SugarElement.fromDom(editor.getBody());
  const isRoot = (elem: SugarElement<Node>) => Compare.eq(elem, rootElem);
  const isOutsideRoot = (startNode: SugarElement<Node>) => !isRoot(startNode) && !Compare.contains(rootElem, startNode);

  const startNode = SugarElement.fromDom(editor.selection.getNode());

  // Ensure the lookup doesn't start on a parent or sibling element of the root node
  if (isOutsideRoot(startNode)) {
    return null;
  }
  return matchStartNode(startNode, scopes.inNodeScope, scopes.inEditorScope).orThunk(() => matchAncestor(isRoot, startNode, scopes));
};

export {
  lookup,
  filterByPositionForStartNode,
  filterByPositionForAncestorNode,
  matchStartNode
};
