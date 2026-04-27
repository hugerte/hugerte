import { Attribute, Class, Compare, SelectorExists, SelectorFilter, SelectorFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as Markings from './Markings';

const isRoot = (root: SugarElement<Node>) => (node: SugarElement<Node>) =>
  Compare.eq(node, root);

// Given the current editor selection, identify the uid of any current
// annotation
const identify = (editor: Editor, annotationName: (string) | null): ({ uid: string; name: string; elements: SugarElement<Element>[] }) | null => {
  const rng = editor.selection.getRng();

  const start = SugarElement.fromDom(rng.startContainer);
  const root = SugarElement.fromDom(editor.getBody());

  const selector = annotationName === null
    ? '.' + Markings.annotation()
    : `[${Markings.dataAnnotation()}="${annotationName}"]`;

  const newStart = Traverse.child(start, rng.startOffset) ?? (start);
  const closest = SelectorFind.closest(newStart, selector, isRoot(root));

  if (closest === null) {
    return null;
  }
  return Attribute.getOpt(closest, `${Markings.dataAnnotationId()}`).bind((uid) =>
    Attribute.getOpt(closest, `${Markings.dataAnnotation()}`).map((name) => {
      const elements = findMarkers(editor, uid);
      return {
        uid,
        name,
        elements
      };
    })
  ).fold(() => null, (x) => x);
};

const isAnnotation = (elem: any): boolean => SugarNode.isElement(elem) && Class.has(elem, Markings.annotation());

const isBogusElement = (elem: SugarElement<Node>, root: SugarElement<Node>) =>
  Attribute.has(elem, 'data-mce-bogus') || SelectorExists.ancestor(elem, '[data-mce-bogus="all"]', isRoot(root));

const findMarkers = (editor: Editor, uid: string): Array<SugarElement<Element>> => {
  const body = SugarElement.fromDom(editor.getBody());
  const descendants = SelectorFilter.descendants(body, `[${Markings.dataAnnotationId()}="${uid}"]`);
  return (descendants).filter((descendant) => !isBogusElement(descendant, body));
};

const findAll = (editor: Editor, name: string): Record<string, SugarElement<Element>[]> => {
  const body = SugarElement.fromDom(editor.getBody());
  const markers = SelectorFilter.descendants(body, `[${Markings.dataAnnotation()}="${name}"]`);
  const directory: Record<string, SugarElement<Element>[]> = {};
  (markers).forEach((m) => {
    if (!isBogusElement(m, body)) {
      const uid = Attribute.get(m, Markings.dataAnnotationId()) as string;
      const nodesAlready: SugarElement<Element>[] = ((directory)[uid] ?? null) ?? ([]);
      directory[uid] = nodesAlready.concat([ m ]);
    }
  });
  return directory;
};

export {
  identify,
  isAnnotation,
  findMarkers,
  findAll
};
