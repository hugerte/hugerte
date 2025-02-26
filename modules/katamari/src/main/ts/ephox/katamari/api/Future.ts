import { LazyValue } from './LazyValue';

/**
 * Future<T> represents an asynchronous computation. It is deprecated in favor of native Promises.
 * @deprecated Use native Promises instead of Future. See method-specific notes for migration steps.
 */
export interface Future<T> {
  /**
   * @deprecated Use `promise.then(mapper)` instead.
   * Transforms the value inside the Future using a mapping function.
   * Example:
   * Future: `future.map(v => v + 1)`
   * Promise: `promise.then(v => v + 1)`
   */
  readonly map: <U>(mapper: (v: T) => U) => Future<U>;

  /**
   * @deprecated Use `promise.then(binder)` where `binder` returns a Promise.
   * Chains another Future operation that depends on the result of this Future.
   * Example:
   * Future: `future.bind(v => Future.pure(v + 1))`
   * Promise: `promise.then(v => Promise.resolve(v + 1))`
   */
  readonly bind: <U>(binder: (v: T) => Future<U>) => Future<U>;

  /**
   * @deprecated Use `promise.then(() => otherPromise)` instead.
   * Executes another Future ignoring the result of this one.
   * Example:
   * Future: `future.anonBind(otherFuture)`
   * Promise: `promise.then(() => otherPromise)`
   */
  readonly anonBind: <U>(thunk: Future<U>) => Future<U>;

  /**
   * @deprecated Use lazy computations directly or a custom lazy-loading pattern.
   * Converts the Future to a LazyValue that defers computation until accessed.
   */
  readonly toLazy: () => LazyValue<T>;

  /**
   * @deprecated Use memoization or store the result of a Promise directly.
   * Converts this Future to a cached version that computes the result once.
   */
  readonly toCached: () => Future<T>;

  /**
   * @deprecated Use the Promise directly.
   * Converts the Future to a Promise.
   */
  readonly toPromise: () => Promise<T>;

  /**
   * @deprecated Use `promise.then(callback)` instead.
   * Executes the Future and invokes a callback with the result.
   * Example:
   * Future: `future.get(callback)`
   * Promise: `promise.then(callback)`
   */
  readonly get: (callback: (v: T) => void) => void;
}

// Error reporter to handle errors without being swallowed by Promises.
const errorReporter = (err: any) => {
  setTimeout(() => {
    throw err; // Throwing asynchronously so errors can be logged without halting Promise execution.
  }, 0);
};

/**
 * Constructs a Future<T> from a function that returns a Promise<T>.
 * @param run A function that returns a Promise<T> when called.
 * @returns A Future<T> that wraps the Promise.
 */
const make = <T = any>(run: () => Promise<T>): Future<T> => {
  const get = (callback: (value: T) => void) => {
    run().then(callback, errorReporter);
  };

  const map = <U>(fab: (v: T) => U) => {
    return make(() => run().then(fab));
  };

  const bind = <U>(aFutureB: (v: T) => Future<U>) => {
    return make(() => run().then((v) => aFutureB(v).toPromise()));
  };

  const anonBind = <U>(futureB: Future<U>) => {
    return make(() => run().then(() => futureB.toPromise()));
  };

  const toLazy = () => {
    return LazyValue.nu(get);
  };

  const toCached = () => {
    let cache: Promise<T> | null = null;
    return make(() => {
      if (cache === null) {
        cache = run();
      }
      return cache;
    });
  };

  const toPromise = run;

  return {
    map,
    bind,
    anonBind,
    toLazy,
    toCached,
    toPromise,
    get,
  };
};

/**
 * Creates a Future from a base function.
 * @deprecated Use `new Promise(baseFn)` directly.
 * Example:
 * ```typescript
 * // Future: Future.nu(callback => setTimeout(() => callback(42), 1000));
 * // Promise: new Promise(resolve => setTimeout(() => resolve(42), 1000));
 * ```
 */
const nu: {
  <T = any>(baseFn: (completer: (value: T) => void) => void): Future<T>;
  (baseFn: (completer: () => void) => void): Future<void>;
} = <T = any>(baseFn: (completer: (value?: T) => void) => void): Future<T | void> => {
  return make(() => new Promise(baseFn));
};

/**
 * Wraps a value in a Future.
 * @deprecated Use `Promise.resolve(value)` instead.
 * Example:
 * ```typescript
 * // Future: Future.pure(42)
 * // Promise: Promise.resolve(42)
 * ```
 */
const pure = <T>(a: T): Future<T> => {
  return make(() => Promise.resolve(a));
};

/**
 * Provides backward compatibility for code using Future.
 * @deprecated Use Promises directly for all asynchronous logic.
 */
export const Future = {
  nu,
  pure
};
