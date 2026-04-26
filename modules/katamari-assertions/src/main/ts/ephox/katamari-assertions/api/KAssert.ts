import { Assert, TestLabel } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';
import { OptionalInstances, Result, ResultInstances } from '@ephox/katamari';

const { tOptional } = OptionalInstances;
const { tResult } = ResultInstances;
const { tAny } = Testable;
type Testable<A> = Testable.Testable<A>;

// NOTE: Don't use this within Agar - use tOptional directly

export const eqOptional = <A> (message: TestLabel, expected: A | null, actual: A | null, testableA: Testable<A> = tAny): void =>
  Assert.eq(message, expected, actual, tOptional(testableA));

export const eqNone = <A> (message: TestLabel, actual: A | null): void =>
  eqOptional(message, null, actual, tAny);

export const eqSome = <A> (message: TestLabel, expected: A, actual: A | null, testableA: Testable<A> = tAny): void =>
  eqOptional(message, expected, actual, testableA);

export const eqResult = <A, E> (message: TestLabel, expected: Result<A, E>, actual: Result<A, E>, testableA: Testable<A> = tAny, testableE: Testable<E> = tAny): void =>
  Assert.eq(message, expected, actual, tResult(testableA, testableE));

export const eqValue = <A, E> (message: TestLabel, expected: A, actual: Result<A, E>, testableA: Testable<A> = tAny, testableE: Testable<E> = tAny): void =>
  eqResult(message, Result.value(expected), actual, testableA, testableE);

export const eqError = <A, E> (message: TestLabel, expected: E, actual: Result<A, E>, testableA: Testable<A> = tAny, testableE: Testable<E> = tAny): void =>
  eqResult(message, Result.error(expected), actual, testableA, testableE);
