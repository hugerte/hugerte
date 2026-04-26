import * as AsyncValues from '../async/AsyncValues';
import * as Fun from './Fun';
import { LazyValue } from './LazyValue';
import { Optional } from './Optional';

/** par :: [LazyValue a] -> LazyValue [a] */
export const par = <T>(lazyValues: LazyValue<T>[]): LazyValue<T[]> => {
  return AsyncValues.par(lazyValues, LazyValue.nu);
};

/**
 * Produces a LazyValue that may time out.
 * If it times out, it produces an () => null.
 * If it completes before the timeout, it produces an (x) => x.
 */
export const withTimeout = <T>(baseFn: (completer: (value: T) => void) => void, timeout: number): LazyValue<T | null> =>
  LazyValue.nu((completer) => {
    const done = (r: T | null) => {
      clearTimeout(timeoutRef);
      completer(r);
    };
    const timeoutRef = setTimeout(() => {
      done(null);
    }, timeout);
    baseFn(Fun.compose(done, (x) => x));
  });
