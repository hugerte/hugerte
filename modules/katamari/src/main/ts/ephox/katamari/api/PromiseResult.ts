import { Result } from './Result';

export interface PromiseResult<A, E> extends Promise<Result<A, E>> {
  readonly bindPromise: <B>(f: (value: A) => Promise<Result<B, E>>) => PromiseResult<B, E>;
  readonly bindResult: <B>(f: (value: A) => Result<B, E>) => PromiseResult<B, E>;
  readonly mapResult: <B>(f: (value: A) => B) => PromiseResult<B, E>;
  readonly mapError: <B>(f: (error: E) => B) => PromiseResult<A, B>;
  readonly foldResult: <X>(whenError: (error: E) => X, whenValue: (value: A) => X) => Promise<X>;
  readonly withTimeout: (timeout: number, errorThunk: () => E) => PromiseResult<A, E>;
}

const wrap = <A = any, E = any> (delegate: Promise<Result<A, E>>): PromiseResult<A, E> => {

  const bindPromise = <B>(f: (value: A) => Promise<Result<B, E>>) => {
    return wrap(
      delegate.then(
        (resA) => resA.fold(
          (err: E) => (Promise.resolve(Result.error(err))),
          (a: A) => f(a)
        )
      )
    );
  };

  const bindResult = <B>(f: (value: A) => Result<B, E>) => {
    return wrap(delegate.then((resA) => resA.bind(f)));
  };

  const mapResult = <B>(f: (value: A) => B) => {
    return wrap(delegate.then((resA) => resA.map(f)));
  };

  const mapError = <B>(f: (error: E) => B) => {
    return wrap(delegate.then((resA) => resA.mapError(f)));
  };

  const foldResult = <X>(whenError: (error: E) => X, whenValue: (value: A) => X) => {
    return delegate.then((res) => res.fold(whenError, whenValue));
  };

  const withTimeout = (timeout: number, errorThunk: () => E) => {
    return wrap(new Promise((callback: (value: Result<A, E>) => void) => {
      let timedOut = false;
      const timer = setTimeout(() => {
        timedOut = true;
        callback(Result.error(errorThunk()));
      }, timeout);

      delegate.then((result) => {
        if (!timedOut) {
          clearTimeout(timer);
          callback(result);
        }
      });
    }));
  };

  return {
    ...delegate,
    bindPromise,
    bindResult,
    mapResult,
    mapError,
    foldResult,
    withTimeout
  };
};

const nu = <A = any, E = any>(worker: (completer: (result: Result<A, E>) => void) => void): PromiseResult<A, E> => {
  return wrap(new Promise(worker));
};

const value = <A, E = any>(value: A): PromiseResult<A, E> => {
  return wrap(Promise.resolve(Result.value(value)));
};

const error = <A = any, E = any>(error: E): PromiseResult<A, E> => {
  return wrap(Promise.resolve(Result.error(error)));
};

const fromResult = <A, E>(result: Result<A, E>): PromiseResult<A, E> => {
  return wrap(Promise.resolve(result));
};

const fromPromise = <T, E = any>(promise: Promise<T>): PromiseResult<T, E> => {
  return nu((completer: (result: Result<T, E>) => void) => {
    promise.then((value) => {
      completer(Result.value(value));
    }, (error: E) => {
      completer(Result.error(error));
    });
  });
};

export const PromiseResult = {
  nu,
  wrap,
  pure: value,
  value,
  error,
  fromResult,
  fromPromise
};
