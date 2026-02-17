/**
 * Creates a function that caches the result of the first invocation and returns the cached result
 * for subsequent calls, regardless of the arguments provided.
 *
 * @template T - The type of the function to be cached.
 * @param f - The function whose result should be cached.
 * @returns A new function that wraps the original function `f` and caches its result.
 *
 * @example
 * const expensiveCalculation = (x: number) => {
 *   console.log('Calculating...');
 *   return x * 2;
 * };
 * const cachedCalculation = cached(expensiveCalculation);
 *
 * console.log(cachedCalculation(5)); // Logs "Calculating..." and returns 10
 * console.log(cachedCalculation(5)); // Returns 10 without logging "Calculating..."
 */
export const cached = <T extends (...args: any[]) => any>(f: T): (...args: Parameters<T>) => ReturnType<T> => {
  let called = false;
  let r: any;
  return (...args) => {
    if (!called) {
      called = true;
      r = f.apply(null, args);
    }
    return r;
  };
};
