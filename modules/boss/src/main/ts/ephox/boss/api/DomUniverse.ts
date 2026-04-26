import {
  Attribute, Compare, Css, Insert, InsertAll, PredicateFilter, PredicateFind, Remove, SelectorFilter, SelectorFind, SugarElement, SugarNode,
  SugarText, Traverse
} from '@ephox/sugar';

import TagBoundaries from '../common/TagBoundaries';
import { Universe } from './Universe';

export default (): Universe<SugarElement, Document> => {
  const clone = (element: SugarElement<Node>) => {
    return SugarElement.fromDom(element.dom.cloneNode(false));
  };

  const document = (element: SugarElement<Node>) => Traverse.documentOrOwner(element).dom;

  const isBoundary = (element: SugarElement) => {
    if (!SugarNode.isElement(element)) {
      return false;
    }
    if (SugarNode.name(element) === 'body') {
      return true;
    }
    return (TagBoundaries).includes(SugarNode.name(element));
  };

  const isEmptyTag = (element: SugarElement) => {
    if (!SugarNode.isElement(element)) {
      return false;
    }
    return ([ 'br', 'img', 'hr', 'input' ]).includes(SugarNode.name(element));
  };

  const isNonEditable = (element: SugarElement) => SugarNode.isElement(element) && Attribute.get(element, 'contenteditable') === 'false';

  const comparePosition = (element: SugarElement<Node>, other: SugarElement<Node>) => {
    return element.dom.compareDocumentPosition(other.dom);
  };

  const copyAttributesTo = (source: SugarElement, destination: SugarElement) => {
    const as = Attribute.clone(source);
    Attribute.setAll(destination, as);
  };

  const isSpecial = (element: SugarElement<Node>) => {
    const tag = SugarNode.name(element);
    return ([
      'script', 'noscript', 'iframe', 'noframes', 'noembed', 'title', 'style', 'textarea', 'xmp'
    ]).includes(tag);
  };

  const getLanguage = (element: SugarElement<Node>): (string) | null =>
    SugarNode.isElement(element) ? Attribute.getOpt(element, 'lang') : null;

  return {
    up: () => {
      selector: SelectorFind.ancestor,
      closest: SelectorFind.closest,
      predicate: PredicateFind.ancestor,
      all: Traverse.parents
    },
    down: () => {
      selector: SelectorFilter.descendants,
      predicate: PredicateFilter.descendants
    },
    styles: () => {
      get: Css.get,
      getRaw: Css.getRaw,
      set: Css.set,
      remove: Css.remove
    },
    attrs: () => {
      get: Attribute.get,
      set: Attribute.set,
      remove: Attribute.remove,
      copyTo: copyAttributesTo
    },
    insert: () => {
      before: Insert.before,
      after: Insert.after,
      afterAll: InsertAll.after,
      append: Insert.append,
      appendAll: InsertAll.append,
      prepend: Insert.prepend,
      wrap: Insert.wrap
    },
    remove: () => {
      unwrap: Remove.unwrap,
      remove: Remove.remove
    },
    create: () => {
      nu: SugarElement.fromTag,
      clone,
      text: SugarElement.fromText
    },
    query: () => {
      comparePosition,
      prevSibling: Traverse.prevSibling,
      nextSibling: Traverse.nextSibling
    },
    property: () => {
      children: Traverse.children,
      name: SugarNode.name,
      parent: Traverse.parent,
      document,
      isText: SugarNode.isText,
      isComment: SugarNode.isComment,
      isElement: SugarNode.isElement,
      isSpecial,
      getLanguage,
      getText: SugarText.get,
      setText: SugarText.set,
      isBoundary,
      isEmptyTag,
      isNonEditable
    },
    eq: Compare.eq,
    is: Compare.is
  };
};
