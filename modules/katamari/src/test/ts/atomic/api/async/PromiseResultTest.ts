import { describe, it } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { PromiseResult } from 'ephox/katamari/api/PromiseResult';
import { Result } from 'ephox/katamari/api/Result';
import { tResult } from 'ephox/katamari/api/ResultInstances';
import { arbResult } from 'ephox/katamari/test/arb/ArbDataTypes';
import { eqAsync } from 'ephox/katamari/test/AsyncProps';

type Testable<A> = Testable.Testable<A>;
const { tNumber } = Testable;

describe('atomic.katamari.ap.async.PromiseResultTest', () => {
  it('nu', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
    PromiseResult.nu((completer) => {
      completer(r);
    }).then((ii) => {
      eqAsync('eq', r, ii, reject, tResult());
      resolve();
    });
  }))));

  it('wrap get', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
    PromiseResult.wrap(Promise.resolve(r)).then((ii) => {
      eqAsync('eq', r, ii, reject, tResult());
      resolve();
    });
  }))));

  it('fromResult get', () => fc.assert(fc.asyncProperty(arbResult(fc.integer(), fc.integer()), (r) => new Promise((resolve, reject) => {
    PromiseResult.fromResult(r).then((ii) => {
      eqAsync('eq', r, ii, reject, tResult());
      resolve();
    });
  }))));

  it('pure get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    PromiseResult.pure<number, unknown>(i).then((ii) => {
      eqAsync('eq', Result.value(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('value get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    PromiseResult.value<number, unknown>(i).then((ii) => {
      eqAsync('eq', Result.value(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('error get', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    PromiseResult.error<unknown, number>(i).then((ii) => {
      eqAsync('eq', Result.error(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('value mapResult', () => {
    const f = (x: number) => x + 3;
    return fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
      PromiseResult.value(i).mapResult(f).then((ii) => {
        eqAsync('eq', Result.value(f(i)), ii, reject, tResult());
        resolve();
      });
    })));
  });

  it('error mapResult', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    PromiseResult.error(i).mapResult(Fun.die('should not be called')).then((ii) => {
      eqAsync('eq', Result.error(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('value mapError', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    PromiseResult.value(i).mapError(Fun.die('should not be called')).then((ii) => {
      eqAsync('eq', Result.value(i), ii, reject, tResult());
      resolve();
    });
  }))));

  it('err mapError', () => {
    const f = (x: number) => x + 3;
    return fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
      PromiseResult.error(i).mapError(f).then((ii) => {
        eqAsync('eq', Result.error(f(i)), ii, reject, tResult());
        resolve();
      });
    })));
  });

  it('value bindPromise value', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    const f = (x: number) => x % 4;
    PromiseResult.value(i).bindPromise((x) => PromiseResult.value(f(x))).then((actual) => {
      eqAsync('bind result', Result.value(f(i)), actual, reject, tResult(tNumber));
      resolve();
    });
  }))));

  it('bindPromise: value bindPromise error', () => fc.assert(fc.asyncProperty(fc.integer(), fc.string(), (i, s) => new Promise((resolve, reject) => {
    PromiseResult.value(i).bindPromise(() => PromiseResult.error(s)).then((actual) => {
      eqAsync('bind result', Result.error(s), actual, reject, tResult(tNumber));
      resolve();
    });
  }))));

  it('error bindPromise', () => fc.assert(fc.asyncProperty(fc.integer(), (i) => new Promise((resolve, reject) => {
    PromiseResult.error(i).bindPromise<never>(Fun.die('should not be called')).then((actual) => {
      eqAsync('bind result', Result.error(i), actual, reject, tResult(tNumber));
      resolve();
    });
  }))));
});
