import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as InternalHtml from 'hugerte/core/paste/InternalHtml';

describe('atomic.hugerte.core.paste.InternalHtmlTest', () => {
  it('mark', () => {
    assert.equal(InternalHtml.mark('abc'), '<!-- x-hugerte/html -->abc');
  });

  it('unmark', () => {
    assert.equal(InternalHtml.unmark('<!-- x-hugerte/html -->abc'), 'abc');
    assert.equal(InternalHtml.unmark('abc<!-- x-hugerte/html -->'), 'abc');
  });

  it('isMarked', () => {
    assert.isTrue(InternalHtml.isMarked('<!-- x-hugerte/html -->abc'));
    assert.isTrue(InternalHtml.isMarked('abc<!-- x-hugerte/html -->'));
    assert.isFalse(InternalHtml.isMarked('abc'));
  });

  it('internalHtmlMime', () => {
    assert.equal(InternalHtml.internalHtmlMime(), 'x-hugerte/html');
  });
});
