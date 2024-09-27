import { describe, it } from '@hugemce/bedrock-client';
import { assert } from 'chai';

import * as Namespace from 'hugemce/katamari/api/Namespace';

describe('atomic.katamari.api.data.NamespaceTest', () => {
  it('NamespaceTest', () => {
    const styles = Namespace.css('hugemce.test');
    const css = styles.resolve('doubletest');
    assert.equal(css, 'hugemce-test-doubletest');
  });
});
