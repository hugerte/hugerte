import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import { Result } from 'ephox/katamari/api/Result';

describe('atomic.katamari.api.data.ResultFromOptionTest', () => {
  it('unit tests', () => {
    const extractError = <T, E>(result: Result<T, E>): E | null => result.fold(
      (e) => e,
      () => null
    );

    const err = Result.fromOption(null, 'err');
    assert.equal(extractError(err).getOrDie('Could not get error value'), 'err');

    const val = Result.fromOption('val', 'err');
    assert.equal(val.getOrDie(), 'val');
  });
});
