import { Assert, describe, it } from '@ephox/bedrock-client';
import { Optional, OptionalInstances } from '@ephox/katamari';
import { assert } from 'chai';
import fc from 'fast-check';

import { parseStartValue, parseDetail, ListDetail } from 'hugerte/plugins/lists/core/ListNumbering';

describe('atomic.hugerte.plugins.lists.core.ListNumberingTest', () => {
  const tOptional = OptionalInstances.tOptional;

  const check = (startValue: string, expectedDetail: Optional<ListDetail>) => {
    expectedDetail.each((expected) => {
      // Test conversion of: start value -> detail
      const actualDetail = parseStartValue(startValue);
      Assert.eq('Should convert start value to expected start value', expected.start, actualDetail.getOrDie().start);
      Assert.eq('Should convert start value to expected list style type', expected.listStyleType, actualDetail.getOrDie().listStyleType, tOptional());

      // When expectedDetail is some, try to convert: detail -> start value
      expectedDetail.map(parseDetail).each((initialStartValue) => {
        assert.equal(startValue, initialStartValue, 'Should convert detail back to initial start value');
      });
    });
  };

  it('TINY-6891: Converts number -> numbered list type detail -> back to initial number', () => check(
    '1',
    { start: '1', listStyleType: null }
  ));

  it('TINY-6891: Converts lowercase letter -> lower-alpha list type detail -> back to initial lowercase letter', () => {
    check(
      'a',
      { start: '1', listStyleType: 'lower-alpha' }'lower-alpha' })
    );
    check(
      'z',
      { start: '26', listStyleType: 'lower-alpha' }'lower-alpha' })
    );
  });

  it('TINY-6891: Converts uppercase letters -> upper-alpha list type detail -> back to initial uppercase letters', () => {
    check(
      'A',
      { start: '1', listStyleType: 'upper-alpha' }'upper-alpha' })
    );
    check(
      'ABCD',
      { start: '19010', listStyleType: 'upper-alpha' }'upper-alpha' })
    );
  });

  it('TINY-6891: Does not convert if the start value is ambiguous', () => {
    check(
      'ABC123',
      null
    );
    check(
      'aB',
      null
    );
  });

  it('TINY-6891: Should be able to convert to and from numbers/list numbering', () => {
    const arbitrary = [
      fc.mapToConstant({ num: 26, build: (v) => String.fromCharCode(65 + v) }),
      fc.mapToConstant({ num: 26, build: (v) => String.fromCharCode(97 + v) }),
      fc.mapToConstant({ num: 10, build: (v) => v.toString() })
    ].map((c) => fc.stringOf(c, 1, 5));

    fc.assert(fc.property(
      fc.oneof(...arbitrary),
      (start) => {
        assert.equal(
          start,
          parseStartValue(start).map(parseDetail).getOrDie(),
          'Should be initial start value'
        );
      }
    ), { endOnFailure: true });
  });
});
