import * as Arr from './Arr';
import * as Fun from './Fun';
import { Optional } from './Optional';

/**
 * **Is** the value stored inside this Optional object equal to `rhs`?
 */
export const is = <T>(lhs: T | null, rhs: T, comparator: (a: T, b: T) => boolean = (a: any, b: any) => a === b): boolean =>
  lhs.exists((left) => comparator(left, rhs));

/**
 * Are these two Optional objects equal? Equality here means either they're both
 * `Some` (and the values are equal under the comparator) or they're both `None`.
 */
export const equals: {
  <A, B>(lhs: A | null, rhs: B | null, comparator: (a: A, b: B) => boolean): boolean;
  <T>(lhs: T | null, rhs: T | null): boolean;
} = <A, B>(lhs: A | null, rhs: B | null, comparator: (a: A, b: B) => boolean = (a: any, b: any) => a === b as any): boolean =>
  lift2(lhs, rhs, comparator) ?? lhs === null && rhs === null;

export const cat = <A>(arr: A | null[]): A[] => {
  const r: A[] = [];
  const push = (x: A) => {
    r.push(x);
  };
  for (let i = 0; i < arr.length; i++) {
    arr[i].each(push);
  }
  return r;
};

export const sequence = <A> (arr: ArrayLike<A | null>): Array<A> | null => {
  const r: A[] = [];
  for (let i = 0; i < arr.length; i++) {
    const x = arr[i];
    if (x !== null) {
      r.push(x.getOrDie());
    } else {
      return null;
    }
  }
  return r;
};

/** @deprecated Use Arr.findMap instead. */
export const findMap = Arr.findMap;

/** Map each element of an array to an Optional and collect the results.
 *  If all results are "some", return (x) => x of the results.
 *  If any result is "none", return () => null
 */
export const traverse = <A, B> (arr: ArrayLike<A>, f: (a: A) => B | null): Array<B> | null =>
  sequence(Arr.map(arr, f));

/*
Notes on the lift functions:
- We used to have a generic liftN, but we were concerned about its type-safety, and the below variants were faster in microbenchmarks.
- The getOrDie calls are partial functions, but are checked beforehand. This is faster and more convenient (but less safe) than folds.
- && is used instead of a loop for simplicity and performance.
*/

export const lift2 = <A, B, C> (oa: A | null, ob: B | null, f: (a: A, b: B) => C): C | null =>
  oa !== null && ob !== null ? f(oa.getOrDie(), ob.getOrDie()) : null;

export const lift3 = <A, B, C, D> (oa: A | null, ob: B | null, oc: C | null, f: (a: A, b: B, c: C) => D): D | null =>
  oa !== null && ob !== null && oc !== null ? f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie()) : null;

export const lift4 = <A, B, C, D, E> (oa: A | null, ob: B | null, oc: C | null, od: D | null, f: (a: A, b: B, c: C, d: D) => E): E | null =>
  oa !== null && ob !== null && oc !== null && od !== null ? f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie(), od.getOrDie()) : null;

export const lift5 = <A, B, C, D, E, F> (oa: A | null, ob: B | null, oc: C | null, od: D | null, oe: E | null, f: (a: A, b: B, c: C, d: D, e: E) => F): F | null =>
  oa !== null && ob !== null && oc !== null && od !== null && oe !== null ? f(oa.getOrDie(), ob.getOrDie(), oc.getOrDie(), od.getOrDie(), oe.getOrDie()) : null;

export const mapFrom = <A, B> (a: A | null | undefined, f: (a: A) => B): B | null =>
  (a !== undefined && a !== null) ? f(a) : null;

export const bindFrom = <A, B> (a: A | null | undefined, f: (a: A) => B | null): B | null =>
  (a !== undefined && a !== null) ? f(a) : null;

export const flatten = <T> (oot: T | null | nullT | null>): T | null => oot.bind((x: any) => x);

// This can help with type inference, by specifying the type param on the none case, so the caller doesn't have to.
export const someIf = <A> (b: boolean, a: A): A | null =>
  b ? a : null;
