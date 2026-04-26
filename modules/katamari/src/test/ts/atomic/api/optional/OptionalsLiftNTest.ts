import { describe, it } from '@ephox/bedrock-client';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertOptional } from 'ephox/katamari/test/AssertOptional';

const boom = Fun.die('should not be called');

describe('atomic.katamari.api.optional.OptionalsLiftNTest', () => {
  it('Optionals.lift2', () => {
    assertNone(Optionals.lift2(null, null, boom));
    assertNone(Optionals.lift2(null, 3, boom));
    assertNone(Optionals.lift2('a', null, boom));
    assertOptional(Optionals.lift2('a', 11, (a, b) => a + b), 'a11');
  });

  it('Optionals.lift3', () => {
    assertNone(Optionals.lift3(null, null, null, boom));
    assertNone(Optionals.lift3(null, null, 3, boom));
    assertNone(Optionals.lift3(null, 'a', null, boom));

    assertNone(Optionals.lift3('z', null, null, boom));
    assertNone(Optionals.lift3('z', null, 3, boom));
    assertNone(Optionals.lift3('z', 'a', null, boom));

    assertOptional(Optionals.lift3('z', 'a', 11, (a, b, c) => a + b + c), 'za11');
  });

  it('Optionals.lift4', () => {
    assertNone(Optionals.lift4(null, null, null, null, boom));
    assertNone(Optionals.lift4(null, null, null, 3, boom));
    assertNone(Optionals.lift4(null, null, 'a', null, boom));
    assertNone(Optionals.lift4(null, 'z', null, null, boom));
    assertNone(Optionals.lift4(null, 'z', null, 3, boom));
    assertNone(Optionals.lift4(null, 'z', 'a', null, boom));

    assertNone(Optionals.lift4(1, null, null, null, boom));
    assertNone(Optionals.lift4(1, null, null, 3, boom));
    assertNone(Optionals.lift4(1, null, 'a', null, boom));
    assertNone(Optionals.lift4(1, 'z', null, null, boom));
    assertNone(Optionals.lift4(1, 'z', null, 3, boom));
    assertNone(Optionals.lift4(1, 'z', 'a', null, boom));

    assertOptional(Optionals.lift4(2, 'z', 'a', 11, (a, b, c, d) => a + b + c + d), '2za11');
  });

  it('Optionals.lift5', () => {
    assertNone(Optionals.lift5(null, null, null, null, null, boom));
    assertNone(Optionals.lift5(null, null, null, null, 3, boom));
    assertNone(Optionals.lift5(null, null, null, 'a', null, boom));
    assertNone(Optionals.lift5(null, null, 'z', null, null, boom));
    assertNone(Optionals.lift5(null, null, 'z', null, 3, boom));
    assertNone(Optionals.lift5(null, null, 'z', 'a', null, boom));
    assertNone(Optionals.lift5(null, 1, null, null, null, boom));
    assertNone(Optionals.lift5(null, 1, null, null, 3, boom));
    assertNone(Optionals.lift5(null, 1, null, 'a', null, boom));
    assertNone(Optionals.lift5(null, 1, 'z', null, null, boom));
    assertNone(Optionals.lift5(null, 1, 'z', null, 3, boom));
    assertNone(Optionals.lift5(null, 1, 'z', 'a', null, boom));

    assertNone(Optionals.lift5(true, null, null, null, null, boom));
    assertNone(Optionals.lift5(true, null, null, null, 3, boom));
    assertNone(Optionals.lift5(true, null, null, 'a', null, boom));
    assertNone(Optionals.lift5(true, null, 'z', null, null, boom));
    assertNone(Optionals.lift5(true, null, 'z', null, 3, boom));
    assertNone(Optionals.lift5(true, null, 'z', 'a', null, boom));
    assertNone(Optionals.lift5(true, 1, null, null, null, boom));
    assertNone(Optionals.lift5(true, 1, null, null, 3, boom));
    assertNone(Optionals.lift5(true, 1, null, 'a', null, boom));
    assertNone(Optionals.lift5(true, 1, 'z', null, null, boom));
    assertNone(Optionals.lift5(true, 1, 'z', null, 3, boom));
    assertNone(Optionals.lift5(true, 1, 'z', 'a', null, boom));

    assertOptional(Optionals.lift5(false, 2, 'z', 'a', 11, (a, b, c, d, e) => a + '' + b + c + d + e), 'false2za11');
  });
});
