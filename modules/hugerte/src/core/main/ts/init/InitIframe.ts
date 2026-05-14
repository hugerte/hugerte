import { Optional, Strings } from '@ephox/katamari';
import { Attribute, DomEvent, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import Env from '../api/Env';
import * as Options from '../api/Options';
import { TranslatedString } from '../api/util/I18n';
import * as InitContentBody from './InitContentBody';

interface BoxInfo {
  readonly editorContainer: HTMLElement | null;
  readonly iframeContainer: HTMLElement;
}

const DOM = DOMUtils.DOM;

class HugeRTEContentArea extends HTMLElement {
  private root: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  public create(id: string, title: TranslatedString, customAttrs: Record<string, string>, tabindex?: number) {
    // This can also be explicitly set by customAttrs, so do this first
    if (tabindex !== undefined) this.tabIndex = tabindex;

    Object.entries(customAttrs).forEach(([key, value]) => {
      this.setAttribute(key, value);
    });

    this.setAttribute('id', id + '_ifr');
    this.setAttribute('frameBorder', '0');
    this.setAttribute('allowTransparency', 'true');
    this.setAttribute('title', title);

    // TODO: replace this globally by something else than iframe
    this.classList.add('tox-edit-area__iframe');
  }
}

customElements.define('hugerte-content-area', HugeRTEContentArea);

// TODO: is customAttrs record type an api break? that will need to be documented?
const createIframeElement = (id: string, title: TranslatedString, customAttrs: Record<string, string>, tabindex: Optional<number>) => {
  const iframe = document.createElement('iframe');

  // This can also be explicitly set by customAttrs, so do this first
  tabindex.each((t) => iframe.setAttribute('tabindex', t.toString()));

  Object.entries(customAttrs).forEach(([key, value]) => {
    iframe.setAttribute(key, value);
  });

  iframe.setAttribute('id', id + '_ifr');
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('allowTransparency', 'true');
  iframe.setAttribute('title', title);

  iframe.classList.add('tox-edit-area__iframe');

  return iframe;
};

const getIframeHtml = (editor: Editor) => {
  let iframeHTML = Options.getDocType(editor) + '<html><head>';

  // We only need to override paths if we have to
  // IE has a bug where it remove site absolute urls to relative ones if this is specified
  if (Options.getDocumentBaseUrl(editor) !== editor.documentBaseUrl) {
    iframeHTML += '<base href="' + editor.documentBaseURI.getURI() + '" />';
  }

  iframeHTML += '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

  const bodyId = Options.getBodyId(editor);
  const bodyClass = Options.getBodyClass(editor);
  const translatedAriaText = editor.translate(Options.getIframeAriaText(editor));

  if (Options.getContentSecurityPolicy(editor)) {
    iframeHTML += '<meta http-equiv="Content-Security-Policy" content="' + Options.getContentSecurityPolicy(editor) + '" />';
  }

  iframeHTML += '</head>' +
    `<body id="${bodyId}" class="mce-content-body ${bodyClass}" data-id="${editor.id}" aria-label="${translatedAriaText}">` +
    '<br>' +
    '</body></html>';

  return iframeHTML;
};

const createIframe = (editor: Editor, boxInfo: BoxInfo) => {
  const iframeTitle = editor.translate('Rich Text Area');
  const tabindex = Attribute.getOpt(SugarElement.fromDom(editor.getElement()), 'tabindex').bind(Strings.toInt);
  const ifr = createIframeElement(editor.id, iframeTitle, Options.getIframeAttrs(editor), tabindex);

  ifr.onload = () => {
    ifr.onload = null;
    editor.dispatch('load');
  };

  editor.contentAreaContainer = boxInfo.iframeContainer;
  editor.iframeElement = ifr;
  editor.iframeHTML = getIframeHtml(editor);
  DOM.add(boxInfo.iframeContainer, ifr);
};

const setupIframeBody = (editor: Editor): void => {
  // Setup iframe body
  const iframe = editor.iframeElement as HTMLIFrameElement;
  const ready = () => {
    // Set the content document, now that it is available
    editor.contentDocument = iframe.contentDocument as Document;

    // Continue to init the editor
    InitContentBody.contentBodyLoaded(editor);
  };

  // TINY-8916: Firefox has a bug in its srcdoc implementation that prevents cookies being sent so unfortunately we need
  // to fallback to legacy APIs to load the iframe content. See https://bugzilla.mozilla.org/show_bug.cgi?id=1741489
  if (Options.shouldUseDocumentWrite(editor) || Env.browser.isFirefox) {
    const doc = editor.getDoc();
    doc.open();
    doc.write(editor.iframeHTML as string);
    doc.close();
    ready();
  } else {
    const binder = DomEvent.bind(SugarElement.fromDom(iframe), 'load', () => {
      binder.unbind();
      ready();
    });
    iframe.srcdoc = editor.iframeHTML as string;
  }
};

const init = (editor: Editor, boxInfo: BoxInfo): void => {
  createIframe(editor, boxInfo);

  if (boxInfo.editorContainer) {
    boxInfo.editorContainer.style.display = editor.orgDisplay;
    editor.hidden = DOM.isHidden(boxInfo.editorContainer);
  }

  editor.getElement().style.display = 'none';
  DOM.setAttrib(editor.id, 'aria-hidden', 'true');
  // Restore visibility on target element
  editor.getElement().style.visibility = editor.orgVisibility as string;

  setupIframeBody(editor);
};

export {
  init
};
