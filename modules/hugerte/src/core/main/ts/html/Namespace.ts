export type NamespaceType = 'html' | 'svg';

export interface NamespaceTracker {
  readonly track: (node: Node) => NamespaceType;
  readonly current: () => NamespaceType;
  readonly reset: () => void;
}

export const isNonHtmlElementRootName = (name: string): boolean => name.toLowerCase() === 'svg';

export const isNonHtmlElementRoot = (node: Node): boolean => isNonHtmlElementRootName(node.nodeName);

export const toScopeType = (node: Node | undefined): NamespaceType => node?.nodeName === 'svg' ? 'svg' : 'html';

export const namespaceElements = [ 'svg' ];

export const createNamespaceTracker = (): NamespaceTracker => {
  let scopes: Node[] = [];

  const peek = () => scopes[scopes.length - 1];

  const track = (node: Node): NamespaceType => {
    if (isNonHtmlElementRoot(node)) {
      scopes.push(node);
    }

    // Pop every scope that does not contain `node`, not just one. A node may
    // be a sibling of an inner SVG that itself was a sibling of an outer SVG
    // (for example <svg><svg></svg></svg><iframe>), in which case two scopes
    // are stale at once. Popping only one would leave the outer SVG on the
    // stack and incorrectly report the iframe as being in SVG scope, which
    // would let the sanitizer accept non-event-handler attributes that the
    // HTML scope would otherwise reject (notably iframe[srcdoc]).
    let currentScope: Node | undefined = peek();
    while (currentScope && !currentScope.contains(node)) {
      scopes.pop();
      currentScope = peek();
    }

    return toScopeType(currentScope);
  };

  const current = () => toScopeType(peek());

  const reset = () => {
    scopes = [];
  };

  return {
    track,
    current,
    reset
  };
};
