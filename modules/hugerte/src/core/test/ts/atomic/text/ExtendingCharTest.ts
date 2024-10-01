import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as ExtendingChar from 'hugerte/core/text/ExtendingChar';

describe('atomic.hugerte.core.text.ExtendingCharTest', () => {
  it('isExtendingChar', () => {
    assert.strictEqual(ExtendingChar.isExtendingChar('a'), false);
    assert.strictEqual(ExtendingChar.isExtendingChar('\u0301'), true);
  });
});
