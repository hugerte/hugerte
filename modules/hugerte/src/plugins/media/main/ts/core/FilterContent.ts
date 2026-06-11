import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';
import AstNode from 'hugerte/core/api/html/Node';
import HtmlSerializer from 'hugerte/core/api/html/Serializer';

import * as Nodes from './Nodes';
import * as Sanitize from './Sanitize';

declare let unescape: any;

const setup = (editor: Editor): void => {
  editor.on('PreInit', () => {
    const { schema, serializer, parser } = editor;
    // Set browser specific allowFullscreen attribs as boolean
    const boolAttrs = schema.getBoolAttrs();
    Arr.each('webkitallowfullscreen mozallowfullscreen'.split(' '), (name) => {
      boolAttrs[name] = {};
    });

    // Add some non-standard attributes to the schema
    Obj.each({
      embed: [ 'wmode' ]
    }, (attrs, name) => {
      const rule = schema.getElementRule(name);
      if (rule) {
        Arr.each(attrs, (attr) => {
          rule.attributes[attr] = {};
          rule.attributesOrder.push(attr);
        });
      }
    });

    // Converts iframe, video etc into placeholder images
    parser.addNodeFilter('iframe,video,audio,object,embed', Nodes.placeHolderConverter(editor));

    // Replaces placeholder images with real elements for video, object, iframe etc
    serializer.addAttributeFilter('data-mce-object', (nodes, name) => {
      let i = nodes.length;
      while (i--) {
        const node = nodes[i];
        if (!node.parent) {
          continue;
        }

        const realElmName = node.attr(name) as string;
        const realElm = new AstNode(realElmName, 1);

        // Add width/height to everything but audio
        if (realElmName !== 'audio') {
          const className = node.attr('class');
          if (className && className.indexOf('mce-preview-object') !== -1 && node.firstChild) {
            realElm.attr({
              width: node.firstChild.attr('width'),
              height: node.firstChild.attr('height')
            });
          } else {
            realElm.attr({
              width: node.attr('width'),
              height: node.attr('height')
            });
          }
        }

        realElm.attr({
          style: node.attr('style')
        });

        // Copy all data-mce-p-* attributes onto the real element without filtering.
        // The element will be run through DOMPurify + schema validation below.
        const attribs = node.attributes ?? [];
        let ai = attribs.length;
        while (ai--) {
          const attrName = attribs[ai].name;
          if (attrName.indexOf('data-mce-p-') === 0) {
            realElm.attr(attrName.substr(11), attribs[ai].value);
          }
        }

        // If the element has no inner HTML, add a filler child so the parser's
        // removeEmpty rule doesn't strip an otherwise-valid empty element.
        const innerHtml = node.attr('data-mce-html');
        const hadInnerHtml = Type.isString(innerHtml);
        if (!hadInnerHtml) {
          const filler = new AstNode('#text', 3);
          filler.value = '\u00a0';
          realElm.append(filler);
        }

        // Serialize the reconstructed element and run it through DOMPurify + schema
        // validation. This lets the editor's existing sanitization infrastructure
        // decide what's safe, rather than ad-hoc attribute blocklisting.
        const elementHtml = HtmlSerializer({}, schema).serialize(realElm);
        let sanitized: AstNode;
        try {
          sanitized = Sanitize.parseAndSanitize(editor, 'body', elementHtml);
        } catch (_e) {
          // parseAndSanitize may throw for special elements (e.g. <script>) — remove the placeholder
          node.remove();
          continue;
        }
        const safeChildren = Arr.filter(sanitized.children(), (child) => child.name === realElmName);

        if (safeChildren.length === 0) {
          // Sanitizer stripped the element due to dangerous attributes — remove the placeholder
          node.remove();
          continue;
        }

        const safeElm = safeChildren[0];

        // Remove the filler child we added
        if (!hadInnerHtml) {
          safeElm.empty();
        }

        // Inject innerhtml (already sanitized through parseAndSanitize)
        if (hadInnerHtml) {
          const fragment = Sanitize.parseAndSanitize(editor, realElmName, unescape(innerHtml));
          Arr.each(fragment.children(), (child) => safeElm.append(child));
        }

        node.replace(safeElm);
      }
    });
  });

  editor.on('SetContent', () => {
    // TODO: This shouldn't be needed there should be a way to mark bogus
    // elements so they are never removed except external save
    const dom = editor.dom;
    Arr.each(dom.select('span.mce-preview-object'), (elm) => {
      if (dom.select('span.mce-shim', elm).length === 0) {
        dom.add(elm, 'span', { class: 'mce-shim' });
      }
    });
  });
};

export {
  setup
};
