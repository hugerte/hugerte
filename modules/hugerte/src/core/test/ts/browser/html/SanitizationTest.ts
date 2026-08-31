import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';

import Schema from 'hugerte/core/api/html/Schema';
import { getSanitizer, MimeType } from 'hugerte/core/html/Sanitization';

describe('browser.hugerte.core.html.SanitizationTest', () => {
  context('Sanitize html', () => {
    const isSafari = PlatformDetection.detect().browser.isSafari();

    const testHtmlSanitizer = (testCase: { input: string; expected: string; mimeType: MimeType; sanitize?: boolean }) => {
      const sanitizer = getSanitizer({ sanitize: testCase.sanitize ?? true }, Schema());

      const body = document.createElement('body');
      body.innerHTML = testCase.input;
      sanitizer.sanitizeHtmlElement(body, testCase.mimeType);

      assert.equal(body.innerHTML, testCase.expected);
    };

    it('Sanitize iframe HTML', () => testHtmlSanitizer({
      input: '<iframe src="x"><script>alert(1)</script></iframe><iframe src="javascript:alert(1)"></iframe>',
      // Valid iframe fallback text is inert raw text, but with SAFE_FOR_XML:true
      // the ELEMENT_MARKUP_PROBE would remove the whole iframe. Valid iframes
      // are emptied before DOMPurify to keep the shell.
      expected: '<iframe src="x"></iframe><iframe></iframe>',
      mimeType: 'text/html'
    }));

    it('Disabled sanitization of iframe HTML', () => testHtmlSanitizer({
      input: '<iframe src="x"><script>alert(1)</script></iframe><iframe src="javascript:alert(1)"></iframe>',
      // Safari seems to encode the contents of iframes
      expected: isSafari ? '<iframe src="x">&lt;script&gt;alert(1)&lt;/script&gt;</iframe><iframe></iframe>' : '<iframe src="x"><script>alert(1)</script></iframe><iframe></iframe>',
      mimeType: 'text/html',
      sanitize: false
    }));

    // Inline event-handler content attributes (`onload`, `onbegin`, `onerror`,
    // ...) on non-root elements inside an SVG must always be stripped. The
    // namespace tracker in Namespace.ts reports them as being in SVG scope,
    // and shouldKeepAttribute trusts every attribute in non-HTML scope, so
    // without the c1674fe on* check the hook would approve the attribute and
    // (because the hook mutates DOMPurify's ALLOWED_ATTR) DOMPurify would
    // keep it. The c1674fe check is the load-bearing defense: the namespace
    // tracker fix only affects element-scope resolution, not the per-element
    // attribute allowlist.
    it('CVE-2026-47760: strips event handler on non-root svg child', () => testHtmlSanitizer({
      input: '<svg><rect onload="alert(1)"></rect></svg>',
      expected: '<svg><rect></rect></svg>',
      mimeType: 'text/html'
    }));

    it('CVE-2026-47760: strips onbegin on svg child element', () => testHtmlSanitizer({
      input: '<svg><circle onbegin="alert(1)"></circle></svg>',
      expected: '<svg><circle></circle></svg>',
      mimeType: 'text/html'
    }));

    // The namespace tracker used to pop only one stale scope per call, so a
    // node that was a sibling of an inner SVG which was itself a sibling of
    // an outer SVG was incorrectly reported as being in SVG scope. That let
    // non-event-handler attributes survive sanitization on HTML elements after
    // a poisoned <svg><svg></svg></svg> prefix. Uses extended_valid_elements
    // rather than valid_elements so the setup() path still applies.
    context('namespace tracker confusion (nested SVGs)', () => {
      const testNamespaceConfusion = (testCase: { input: string; expected: string }) => {
        const schema = Schema({ extended_valid_elements: 'svg[*]' });
        const sanitizer = getSanitizer({ sanitize: true, validate: true, sandbox_iframes: false }, schema);
        const body = document.createElement('body');
        body.innerHTML = testCase.input;
        sanitizer.sanitizeHtmlElement(body, 'text/html');
        assert.equal(body.innerHTML, testCase.expected);
      };

      it('strips srcdoc on iframe after <svg><svg></svg></svg> namespace confusion', () => testNamespaceConfusion({
        input: '<svg><svg></svg></svg><iframe srcdoc="<script>alert(1)</script>"></iframe><p>test</p>',
        expected: '<svg><svg></svg></svg><iframe></iframe><p>test</p>'
      }));

      it('strips srcdoc on iframe after triple-nested SVGs', () => testNamespaceConfusion({
        input: '<svg><svg><svg></svg></svg></svg><iframe srcdoc="<script>alert(1)</script>"></iframe>',
        expected: '<svg><svg><svg></svg></svg></svg><iframe></iframe>'
      }));
    });
  });

  context('Santitize non-html', () => {
    const testNamespaceSanitizer = (testCase: { input: string; expected: string; sanitize?: boolean }) => {
      const sanitizer = getSanitizer({ sanitize: testCase.sanitize ?? true }, Schema());

      const body = document.createElement('body');
      body.innerHTML = testCase.input;
      sanitizer.sanitizeNamespaceElement(body);

      assert.equal(body.innerHTML, testCase.expected);
    };

    it('Sanitize SVG', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></svg>',
      expected: '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></svg>'
    }));

    it('Sanitize SVG with xlink', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><a xlink:href="url"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></a></svg>',
      expected: '<svg><a xlink:href="url"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></a></svg>'
    }));

    it('Sanitize SVG with mixed HTML', () => testNamespaceSanitizer({
      input: '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc><script>alert(1)</script><p>hello</p></circle></a></svg>',
      expected: '<svg><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"><desc></desc></circle></svg>'
    }));

    it('Sanitize SVG with xlink with script url', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><a xlink:href="javascript:alert(1)"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></a></svg>',
      expected: '<svg><a><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></a></svg>'
    }));

    it('Disabled sanitization of SVG', () => testNamespaceSanitizer({
      input: '<svg><script>alert(1)</script><a xlink:href="javascript:alert(1)"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></a></svg>',
      expected: '<svg><script>alert(1)</script><a xlink:href="javascript:alert(1)"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></a></svg>',
      sanitize: false
    }));
  });
});
