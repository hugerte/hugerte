import { describe, it } from '@ephox/bedrock-client';
import { Pprint, Testable } from '@ephox/dispute';
import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';
import { assertOptional } from 'ephox/katamari/test/AssertOptional';

const { tString } = Testable;

describe('atomic.katamari.api.optional.OptionalInstancesTest', () => {
  it('OptionalInstances.testable<number>', () => {
    assertOptional(3, 3);
    assertOptional(3, 3);

    assert.throws(() => {
      assertOptional(2, 3);
    });

    assert.throws(() => {
      assertOptional(null, 3);
    });

    assert.throws(() => {
      assertOptional(3, null);
    });

    assert.throws(() => {
      assertOptional(2, 3);
    });

    assert.throws(() => {
      assertOptional(null, 3);
    });

    assert.throws(() => {
      assertOptional(3, null);
    });
  });

  it('OptionalInstances.testable<string>', () => {
    assertOptional('a', 'a');
    assertOptional('a', 'a');

    assert.throws(() => {
      assertOptional(null, 'a');
    });

    assert.throws(() => {
      assertOptional('a', null);
    });

    assert.throws(() => {
      assertOptional('b', 'a');
    });

    assert.throws(() => {
      assertOptional(null, 'a');
    });

    assert.throws(() => {
      assertOptional('a', null);
    });

    assert.throws(() => {
      assertOptional('b', 'a');
    });
  });

  it('OptionalInstances pprint', () => {
    assert.equal(Pprint.render(null, tOptional(tString)), 'null');
    assert.equal(Pprint.render('cat', tOptional(tString)), '\n  "cat"\n');

    assert.equal(Pprint.render(null, tOptional()), 'null');
    assert.equal(Pprint.render('cat', tOptional()), '\n  "cat"\n');
  });
});
