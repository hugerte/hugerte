
import DOMUtils from 'hugerte/core/api/dom/DOMUtils';
import Editor from 'hugerte/core/api/Editor';

import * as Options from '../api/Options';
import * as Utils from '../core/Utils';
import { LinkDialogInfo } from './DialogTypes';
import { AnchorListOptions } from './sections/AnchorListOptions';
import { ClassListOptions } from './sections/ClassListOptions';
import { LinkListOptions } from './sections/LinkListOptions';
import { RelOptions } from './sections/RelOptions';
import { TargetOptions } from './sections/TargetOptions';

const nonEmptyAttr = (dom: DOMUtils, elem: string | Element, name: string): (string) | null => {
  const val: string | null = dom.getAttrib(elem, name);
  return val !== null && val.length > 0 ? val : null;
};

const extractFromAnchor = (editor: Editor, anchor: (HTMLAnchorElement) | null): LinkDialogInfo['anchor'] => {
  const dom = editor.dom;
  const onlyText = Utils.isOnlyTextSelected(editor);
  const text: (string) | null = onlyText ? Utils.getAnchorText(editor.selection, anchor) : null;
  const url: (string) | null = anchor.bind((anchorElm) => (dom.getAttrib(anchorElm, 'href') ?? null));
  const target: (string) | null = anchor.bind((anchorElm) => (dom.getAttrib(anchorElm, 'target') ?? null));
  const rel = anchor.bind((anchorElm) => nonEmptyAttr(dom, anchorElm, 'rel'));
  const linkClass = anchor.bind((anchorElm) => nonEmptyAttr(dom, anchorElm, 'class'));
  const title = anchor.bind((anchorElm) => nonEmptyAttr(dom, anchorElm, 'title'));

  return {
    url,
    text,
    title,
    target,
    rel,
    linkClass
  };
};

const collect = (editor: Editor, linkNode: (HTMLAnchorElement) | null): Promise<LinkDialogInfo> =>
  LinkListOptions.getLinks(editor).then((links) => {
    const anchor = extractFromAnchor(editor, linkNode);
    return {
      anchor,
      catalogs: {
        targets: TargetOptions.getTargets(editor),
        // This should be initial target. Is anchor.target that?
        rels: RelOptions.getRels(editor, anchor.target),
        classes: ClassListOptions.getClasses(editor),
        anchor: AnchorListOptions.getAnchors(editor),
        link: links
      },
      optNode: linkNode,
      flags: {
        titleEnabled: Options.shouldShowLinkTitle(editor)
      }
    };
  });

export const DialogInfo = {
  collect
};
