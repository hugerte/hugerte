import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as HtmlSanitizer from 'hugerte/themes/silver/ui/core/HtmlSanitizer';

describe('browser.hugerte.themes.silver.ui.core.HtmlSanitizerTest', () => {
  // Under a trusted-types CSP every extra policy creation is a violation, and this
  // sanitizer never uses the TrustedHTML that DOMPurify could return.
  const countPolicyCreations = (action: () => void): number => {
    const factory = (window as any).trustedTypes;
    const original = factory.createPolicy;
    let count = 0;
    factory.createPolicy = function (this: unknown, ...args: unknown[]) {
      count++;
      return original.apply(this, args);
    };
    try {
      action();
    } finally {
      factory.createPolicy = original;
    }
    return count;
  };

  const hasTrustedTypes = typeof (window as any).trustedTypes?.createPolicy === 'function';
  const testIfSupported = hasTrustedTypes ? it : it.skip;

  testIfSupported('Sanitizing an HTML string does not create a Trusted Types policy', () => {
    const count = countPolicyCreations(() => {
      HtmlSanitizer.sanitizeHtmlString('<p>hello</p>');
    });
    assert.equal(count, 0);
  });
});
