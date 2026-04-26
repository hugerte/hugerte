import { context, describe, it } from '@ephox/bedrock-client';

import { assert } from 'chai';

import * as Html from 'hugerte/plugins/visualchars/core/Html';

describe('atomic.hugerte.plugins.visualchars.HtmlTest', () => {
  context('wrapCharWithSpan', () => {
    it('should return correct span with nbsp', () => {
      assert.equal(
        '<span data-mce-bogus="1" class="mce-nbsp">' + '\u00A0' + '</span>',
        Html.wrapCharWithSpan('\u00A0')
      );
    });

    it('should return correct span with soft hyphen', () => {
      assert.equal(
        '<span data-mce-bogus="1" class="mce-shy">' + '\u00AD' + '</span>',
        Html.wrapCharWithSpan('\u00AD')
      );
    });
  });
});
