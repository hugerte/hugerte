import { Arr, Fun, Obj, Strings, Type } from '@ephox/katamari';
import { Attribute, NodeTypes, Remove, Replication, SugarElement } from '@ephox/sugar';
import createDompurify, { Config, DOMPurify, UponSanitizeAttributeHookEvent, UponSanitizeElementHookEvent } from 'dompurify';

import { DomParserSettings } from '../api/html/DomParser';
import Schema from '../api/html/Schema';
import Tools from '../api/util/Tools';
import * as URI from '../api/util/URI';
import * as NodeType from '../dom/NodeType';
import * as Namespace from './Namespace';

export type MimeType = 'text/html' | 'application/xhtml+xml';

interface Sanitizer {
  readonly sanitizeHtmlElement: (body: HTMLElement, mimeType: MimeType) => void;
  readonly sanitizeNamespaceElement: (el: Element) => void;
}

// A list of attributes that should be filtered further based on the parser settings
const filteredUrlAttrs = Tools.makeMap('src,href,data,background,action,formaction,poster,xlink:href');
const internalElementAttr = 'data-mce-type';

// ---------------------------------------------------------------------------
// mXSS tripwire compensation
// ---------------------------------------------------------------------------
// The probes below are the same ones DOMPurify 3.4.x (MPL-2.0 OR Apache-2.0) applies internally
// when SAFE_FOR_XML is enabled (see node_modules/dompurify/dist/purify.cjs.js,
// the ELEMENT_MARKUP_PROBE / COMMENT_MARKUP_PROBE constants used by
// _isUnsafeNode and _sanitizeAttributes). We deliberately leave SAFE_FOR_XML
// at its default (true) so the tripwires stay active, and compensate below
// for the *legitimate* content the tripwires would otherwise strip:
//   1. comments whose data contains markup-like sequences
//   2. allowlisted <script>/<style> code whose text contains "<"
//   3. <iframe> fallback text that looks like markup (shell kept, text dropped)
// Attribute values containing "-->", "] >" or "</script|style|iframe..." are
// intentionally not compensated - removing them is the desired hardening.

const elementMarkupProbe = /<[/\w!]/g;
const commentMarkupProbe = /<[/\w]/g;

const probeMatches = (probe: RegExp, value: string): boolean => {
  // The probes carry the /g flag; reset the sticky lastIndex so repeated
  // calls behave like DOMPurify's internal regExpTest wrapper
  probe.lastIndex = 0;
  return probe.test(value);
};

// Re-parse sensitive characters: zero-width spaces, format/control characters
// and unpaired surrogates that content-processing pipelines commonly strip
// from serialized HTML (HugeRTE itself trims \uFEFF caret markers, see
// text/Zwsp.ts). A comment that matches the markup probe AND contains such a
// character is an mXSS vector: '<!--\uFEFF><iframe onload=...>-></body>-->'
// re-parses as a live iframe once the character is stripped, because
// '<!--\uFEFF>' becomes '<!-->' (an abruptly closed empty comment). Such
// comments are never compensated - they are left for the tripwire to remove.
const reparseSensitiveChar = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028-\u202E\u2060-\u206F\uFEFF\uFFF0-\uFFFB\uD800-\uDFFF]/;

// Elements whose content serialises as raw text (never entity-escaped), so a
// "<" in their text also appears in their innerHTML and trips the element
// tripwire (elements like textarea/title are RCDATA and escape on
// serialisation, so they can never trip the probe).
// - codeElements: user-allowlisted code, preserved via save/restore
// - fallbackElements: embedded/fallback content, shell kept, text dropped
const codeElements = Tools.makeMap('script,style');
const fallbackElements = Tools.makeMap('iframe,noscript,noembed,noframes,xmp,plaintext');

// Sequences that can terminate a comment or the document when raw text is
// re-processed downstream. Raw text containing these is characteristic of the
// ZWNBSP comment-mXSS family (e.g. the '<iframe>-></body>-->' artifact left
// behind when '<!--\uFEFF><iframe onload=...>-></body>-->' is ZWSP-trimmed),
// so such fallback elements are NOT shell-preserved - the tripwire removes
// them.
const reparseBoundaryProbe = /-->|--!>|<\/body|<\/html/i;

// Original content of nodes that was temporarily neutralised while DOMPurify
// ran its tripwire; restored by the afterSanitizeElements hook. Weak keys mean
// a node removed by the tripwire is simply garbage-collected, entry and all.
const savedNodeContent = new WeakMap<Node, string>();

const getTextContent = (node: Node): string => node.textContent ?? '';

const restoreSavedNodeContent = (node: Node): void => {
  const saved = savedNodeContent.get(node);
  if (Type.isString(saved)) {
    if (NodeType.isComment(node) || NodeType.isCData(node)) {
      node.nodeValue = saved;
    } else if (NodeType.isElement(node)) {
      node.textContent = saved;
    }
  }
};

// DOMPurify removes an element with no element children when both its
// textContent and its innerHTML look like markup. Compensate for the
// legitimate cases: allowlisted <script>/<style> code is saved, emptied for
// the duration of the tripwire check and restored afterwards; <iframe>
// fallback text is dropped while keeping the element shell. For other
// elements the markup-like text can only come from a CDATA section (plain
// text is entity-escaped on serialisation, so it never trips the innerHTML
// probe) - CDATA is inert raw data, so it is saved, emptied and restored.
const compensateRawTextElement = (element: Element, tagName: string): void => {
  const textContent = getTextContent(element);
  if (element.hasChildNodes() && !Type.isNonNullable(element.firstElementChild)
      && probeMatches(elementMarkupProbe, textContent)
      && probeMatches(elementMarkupProbe, element.innerHTML)) {
    if (Obj.has(codeElements, tagName) && !new RegExp(`</${tagName}`, 'i').test(textContent)) {
      // Keep the allowlisted code, unless it could prematurely close the
      // element again on re-serialisation (e.g. '</script>' inside a script
      // node built programmatically)
      savedNodeContent.set(element, textContent);
      Remove.empty(SugarElement.fromDom(element));
    } else if (Obj.has(fallbackElements, tagName) && !reparseBoundaryProbe.test(textContent)) {
      // Drop the markup-like fallback text, keep the shell - unless the text
      // contains comment-boundary/document-closing sequences, in which case
      // the element is left for the tripwire to remove entirely
      Remove.empty(SugarElement.fromDom(element));
    } else {
      // The markup probe on innerHTML can only be satisfied by CDATA
      // children in this situation - neutralise them for the tripwire check
      // and restore their data afterwards (unless re-parse sensitive)
      for (const child of Array.from(element.childNodes)) {
        const childValue = child.nodeValue ?? '';
        if (NodeType.isCData(child) && probeMatches(elementMarkupProbe, childValue) && !reparseSensitiveChar.test(childValue)) {
          savedNodeContent.set(child, childValue);
          child.nodeValue = '';
        }
      }
    }
  }
};

let uid = 0;
const processNode = (node: Node, settings: DomParserSettings, schema: Schema, scope: Namespace.NamespaceType, evt?: UponSanitizeElementHookEvent): void => {
  const validate = settings.validate;

  if (node.nodeType === NodeTypes.COMMENT) {
    const commentValue = node.nodeValue ?? '';

    // Pad conditional comments if they aren't allowed
    if (!settings.allow_conditional_comments && /^\[if/i.test(commentValue)) {
      node.nodeValue = ' ' + commentValue;
    }

    // Tripwire compensation: DOMPurify removes any comment whose data matches
    // the comment markup probe (e.g. '<!-- <div class="note">keep me</div> -->'
    // or '<!--[if IE]><p>ie only</p><![endif]-->'). Temporarily empty such
    // comments so they survive the probe, restore their data afterwards. A
    // comment whose data also contains a re-parse sensitive character is NOT
    // compensated - that is the ZWNBSP comment-mXSS family and must be removed.
    if (Type.isNonNullable(evt) && probeMatches(commentMarkupProbe, node.nodeValue ?? '') && !reparseSensitiveChar.test(node.nodeValue ?? '')) {
      savedNodeContent.set(node, node.nodeValue ?? '');
      node.nodeValue = '';
    }
  }

  const lcTagName = evt?.tagName ?? node.nodeName.toLowerCase();

  if (scope !== 'html' && schema.isValid(scope)) {
    if (Type.isNonNullable(evt)) {
      evt.allowedTags[lcTagName] = true;
    }
    return;
  }

  // Just leave non-elements such as text and comments up to dompurify
  if (node.nodeType !== NodeTypes.ELEMENT || lcTagName === 'body') {
    return;
  }

  // Construct the sugar element wrapper
  const element = SugarElement.fromDom(node) as SugarElement<Element>;

  // Determine if we're dealing with an internal attribute
  const isInternalElement = Attribute.has(element, internalElementAttr);

  // Cleanup bogus elements
  const bogus = Attribute.get(element, 'data-mce-bogus');
  if (!isInternalElement && Type.isString(bogus)) {
    if (Type.isNonNullable(evt)) {
      if (bogus === 'all') {
        Remove.empty(element);
      }
      evt.allowedTags[lcTagName] = false;
    } else if (bogus === 'all') {
      Remove.remove(element);
    } else {
      Remove.unwrap(element);
    }
    return;
  }

  // Determine if the schema allows the element and either add it or remove it
  const rule = schema.getElementRule(lcTagName);
  if (validate && !rule) {
    if (Type.isNonNullable(evt)) {
      if (Obj.has(schema.getSpecialElements(), lcTagName)) {
        Remove.empty(element);
      }
      evt.allowedTags[lcTagName] = false;
      return;
    }
    // If a special element is invalid, then remove the entire element instead of unwrapping
    if (Obj.has(schema.getSpecialElements(), lcTagName)) {
      Remove.remove(element);
    } else {
      Remove.unwrap(element);
    }
    return;
  } else {
    if (Type.isNonNullable(evt)) {
      evt.allowedTags[lcTagName] = true;
    }
  }

  // Validate the element using the attribute rules
  if (validate && rule && !isInternalElement) {
    // Fix the attributes for the element, unwrapping it if we have to
    Arr.each(rule.attributesForced ?? [], (attr) => {
      Attribute.set(element, attr.name, attr.value === '{$uid}' ? `mce_${uid++}` : attr.value);
    });
    Arr.each(rule.attributesDefault ?? [], (attr) => {
      if (!Attribute.has(element, attr.name)) {
        Attribute.set(element, attr.name, attr.value === '{$uid}' ? `mce_${uid++}` : attr.value);
      }
    });

    // If none of the required attributes were found then remove
    if (rule.attributesRequired && !Arr.exists(rule.attributesRequired, (attr) => Attribute.has(element, attr))) {
      if (Type.isNonNullable(evt)) {
        evt.allowedTags[lcTagName] = false;
      } else {
        Remove.unwrap(element);
      }
      return;
    }

    // If there are no attributes then remove
    if (rule.removeEmptyAttrs && Attribute.hasNone(element)) {
      if (Type.isNonNullable(evt)) {
        evt.allowedTags[lcTagName] = false;
      } else {
        Remove.unwrap(element);
      }
      return;
    }

    // Change the node name if the schema says to
    if (rule.outputName && rule.outputName !== lcTagName) {
      Replication.mutate(element, rule.outputName as keyof HTMLElementTagNameMap);
    }
  }

  // Tripwire compensation for raw-text/cdata content that survived the schema
  // validation above (only in the DOMPurify-backed sanitize path)
  if (Type.isNonNullable(evt)) {
    compensateRawTextElement(node as Element, lcTagName);
  }
};

const processAttr = (ele: Element, settings: DomParserSettings, schema: Schema, scope: Namespace.NamespaceType, evt: UponSanitizeAttributeHookEvent) => {
  const tagName = ele.tagName.toLowerCase();
  const { attrName, attrValue } = evt;

  evt.keepAttr = shouldKeepAttribute(settings, schema, scope, tagName, attrName, attrValue);

  if (evt.keepAttr) {
    evt.allowedAttributes[attrName] = true;

    if (isBooleanAttribute(attrName, schema)) {
      evt.attrValue = attrName;
    }

    // We need to tell DOMPurify to forcibly keep the attribute if it's an SVG data URI and svg data URIs are allowed
    if (settings.allow_svg_data_urls && Strings.startsWith(attrValue, 'data:image/svg+xml')) {
      evt.forceKeepAttr = true;
    }
    // For internal elements always keep the attribute if the attribute name is id, class or style
  } else if (isRequiredAttributeOfInternalElement(ele, attrName)) {
    evt.forceKeepAttr = true;
  }
};

const shouldKeepAttribute = (settings: DomParserSettings, schema: Schema, scope: Namespace.NamespaceType, tagName: string, attrName: string, attrValue: string): boolean => {
  // All attributes within non-HTML namespaces are considered valid,
  // but inline event handlers (onclick, onload, onbegin, etc.) are
  // never legitimate content attributes in any scope.
  if (scope !== 'html' && !Namespace.isNonHtmlElementRootName(tagName)) {
    if (isEventHandlerAttr(attrName)) {
      return false;
    }
    return true;
  }

  return !(attrName in filteredUrlAttrs && URI.isInvalidUri(settings, attrValue, tagName)) &&
    (!settings.validate || schema.isValid(tagName, attrName) || Strings.startsWith(attrName, 'data-') || Strings.startsWith(attrName, 'aria-'));
};

const isEventHandlerAttr = (name: string): boolean => /^on[a-z]/i.test(name);

const isRequiredAttributeOfInternalElement = (ele: Element, attrName: string): boolean =>
  ele.hasAttribute(internalElementAttr) && (attrName === 'id' || attrName === 'class' || attrName === 'style');

const isBooleanAttribute = (attrName: string, schema: Schema): boolean =>
  attrName in schema.getBoolAttrs();

const filterAttributes = (ele: Element, settings: DomParserSettings, schema: Schema, scope: Namespace.NamespaceType): void => {
  const { attributes } = ele;
  for (let i = attributes.length - 1; i >= 0; i--) {
    const attr = attributes[i];
    const attrName = attr.name;
    const attrValue = attr.value;
    if (!shouldKeepAttribute(settings, schema, scope, ele.tagName.toLowerCase(), attrName, attrValue) && !isRequiredAttributeOfInternalElement(ele, attrName)) {
      ele.removeAttribute(attrName);
    } else if (isBooleanAttribute(attrName, schema)) {
      ele.setAttribute(attrName, attrName);
    }
  }
};

const setupPurify = (settings: DomParserSettings, schema: Schema, namespaceTracker: Namespace.NamespaceTracker): DOMPurify => {
  const purify = createDompurify();

  // We use this to add new tags to the allow-list as we parse, if we notice that a tag has been banned but it's still in the schema
  purify.addHook('uponSanitizeElement', (ele, evt) => {
    processNode(ele, settings, schema, namespaceTracker.track(ele), evt);
  });

  // Let's do the same thing for attributes
  purify.addHook('uponSanitizeAttribute', (ele, evt) => {
    processAttr(ele, settings, schema, namespaceTracker.current(), evt);
  });

  // Restore any content we temporarily neutralised to get it past the
  // SAFE_FOR_XML mXSS tripwire. This hook only runs for nodes that survived
  // the tripwire; nodes it removed never reach this point.
  purify.addHook('afterSanitizeElements', (node) => {
    restoreSavedNodeContent(node);
  });

  return purify;
};

const getPurifyConfig = (settings: DomParserSettings, mimeType: DOMParserSupportedType): Config => {
  const basePurifyConfig: Config = {
    IN_PLACE: true,
    ALLOW_UNKNOWN_PROTOCOLS: true,
    // Deliberately ban all tags and attributes by default, and then un-ban them on demand in hooks
    // #comment and #cdata-section are always allowed as they aren't controlled via the schema
    // body is also allowed due to the DOMPurify checking the root node before sanitizing
    ALLOWED_TAGS: [ '#comment', '#cdata-section', 'body' ],
    ALLOWED_ATTR: [],
    // SAFE_FOR_XML is intentionally left at its DOMPurify default (true): it
    // powers the mXSS tripwires that strip ZWNBSP-based comment mXSS (see
    // issue #203). The legitimate content the tripwires would otherwise remove
    // is compensated for in processNode/restoreSavedNodeContent above.
  };
  const config = { ...basePurifyConfig };

  // Set the relevant parser mimetype
  config.PARSER_MEDIA_TYPE = mimeType;

  // Allow any URI when allowing script urls
  if (settings.allow_script_urls) {
    config.ALLOWED_URI_REGEXP = /.*/;
  // Allow anything except javascript (or similar) URIs if all html data urls are allowed
  } else if (settings.allow_html_data_urls) {
    config.ALLOWED_URI_REGEXP = /^(?!(\w+script|mhtml):)/i;
  }

  return config;
};

const sanitizeNamespaceElement = (ele: Element) => {
  // xlink:href used to be the way to do links in SVG 1.x https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xlink:href
  const xlinkAttrs = [ 'type', 'href', 'role', 'arcrole', 'title', 'show', 'actuate', 'label', 'from', 'to' ].map((name) => `xlink:${name}`);
  const config: Config = {
    IN_PLACE: true,
    USE_PROFILES: {
      html: true,
      svg: true,
      svgFilters: true
    },
    ALLOWED_ATTR: xlinkAttrs
  };

  createDompurify().sanitize(ele, config);

  return ele.innerHTML;
};

const getSanitizer = (settings: DomParserSettings, schema: Schema): Sanitizer => {
  const namespaceTracker = Namespace.createNamespaceTracker();

  if (settings.sanitize) {
    const purify = setupPurify(settings, schema, namespaceTracker);
    const sanitizeHtmlElement = (body: HTMLElement, mimeType: MimeType) => {
      purify.sanitize(body, getPurifyConfig(settings, mimeType));
      purify.removed = [];
      namespaceTracker.reset();
    };

    return {
      sanitizeHtmlElement,
      sanitizeNamespaceElement
    };
  } else {
    const sanitizeHtmlElement = (body: HTMLElement, _mimeType: MimeType) => {
      // eslint-disable-next-line no-bitwise
      const nodeIterator = document.createNodeIterator(body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT);
      let node;
      while ((node = nodeIterator.nextNode())) {
        const currentScope = namespaceTracker.track(node);

        processNode(node, settings, schema, currentScope);
        if (NodeType.isElement(node)) {
          filterAttributes(node, settings, schema, currentScope);
        }
      }

      namespaceTracker.reset();
    };

    const sanitizeNamespaceElement = Fun.noop;

    return {
      sanitizeHtmlElement,
      sanitizeNamespaceElement
    };
  }
};

export {
  getSanitizer,
  internalElementAttr
};
