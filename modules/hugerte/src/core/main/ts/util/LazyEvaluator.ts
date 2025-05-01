import { Optional } from '@ephox/katamari';

/**
 * Applies functions in order until one of them returns a Some value.
 *
 * @param {Array<(...args: T) => Optional<R>>} fns - functions to apply. If any of them return a Some, then that Some is returned.
 * @param {T} args - arguments to pass to each function
 * @return {Optional<R>} - the first Some value returned by a function, or None if none of them return a Some.
 */
const evaluateUntil = <T extends any[], R>(fns: Array<(...args: T) => Optional<R>>, args: T): Optional<R> => {
  for (let i = 0; i < fns.length; i++) {
    const result = fns[i].apply(null, args);
    if (result.isSome()) {
      return result;
    }
  }

  return Optional.none();
};

export {
  evaluateUntil
};
