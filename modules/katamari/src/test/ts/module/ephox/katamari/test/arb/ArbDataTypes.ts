import fc from 'fast-check';

import { Optional } from 'ephox/katamari/api/Optional';
import { Result } from 'ephox/katamari/api/Result';

type Arbitrary<A> = fc.Arbitrary<A>;

export const arbResultError = <A = never, E = any> (arbE: Arbitrary<E>): Arbitrary<Result<A, E>> =>
  arbE.map(Result.error);

export const arbResultValue = <A, E = never> (arbA: Arbitrary<A>): Arbitrary<Result<A, E>> =>
  arbA.map(Result.value);

export const arbResult = <A, E> (arbA: Arbitrary<A>, arbE: Arbitrary<E>): Arbitrary<Result<A, E>> =>
  fc.oneof(arbResultError<A, E>(arbE), arbResultValue<A, E>(arbA));

export const arbOptionalNone = <T> (): Arbitrary<Optional<T>> => fc.constant(Optional.none<T>());
export const arbOptionalSome = <T> (at: Arbitrary<T>): Arbitrary<Optional<T>> => at.map(Optional.some);

export const arbOptional = <T> (at: Arbitrary<T>): Arbitrary<Optional<T>> => fc.oneof(arbOptionalNone<T>(), arbOptionalSome(at));

export const arbNegativeInteger = (): Arbitrary<number> => fc.integer(Number.MIN_SAFE_INTEGER, -1);
