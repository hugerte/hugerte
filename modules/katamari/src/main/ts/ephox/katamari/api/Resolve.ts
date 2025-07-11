import { Global } from './Global';

/**
 * Resolves a value from a nested object structure based on a given path of keys.
 *
 * @template T - The expected type of the resolved value.
 * @param parts - An array of strings representing the path of keys to traverse.
 * @param scope - An optional object to use as the starting point for traversal.
 *                If not provided, the global object (`Global`) is used.
 * @returns The value found at the specified path, or `undefined` if the path does not exist.
 */
export const path = <T>(parts: string[], scope?: {}): T | undefined => {
  let o = scope !== undefined && scope !== null ? scope : Global;
  for (let i = 0; i < parts.length && o !== undefined && o !== null; ++i) {
    o = o[parts[i]];
  }
  return o;
};

/**
 * Resolves a value from a nested object structure based on a dot-separated string path.
 *
 * @template T - The expected type of the resolved value.
 * @param p - A dot-separated string representing the path of keys to traverse.
 * @param scope - An optional object to use as the starting point for traversal.
 *                If not provided, the global object (`Global`) is used.
 * @returns The value found at the specified path, or `undefined` if the path does not exist.
 */
export const resolve = <T>(p: string, scope?: {}): T | undefined => {
  const parts = p.split('.');
  return path(parts, scope);
};

/**
 * Ensures that a property exists on an object, initializing it to an empty object if it does not exist.
 *
 * @template T - The type of the object.
 * @template K - The key type of the object.
 * @param o - The object to modify.
 * @param part - The key to ensure exists on the object.
 * @returns The value of the property at the specified key, which is guaranteed to be an object.
 */
export const step = <T extends {}, K extends keyof T>(o: T, part: K): T[K] => {
  if (o[part] === undefined || o[part] === null) {
    o[part] = {} as T[K];
  }
  return o[part];
};

/**
 * Creates a nested object structure based on an array of keys, initializing missing properties to empty objects.
 *
 * @template T - An array of strings representing the keys to create.
 * @param parts - An array of strings representing the path of keys to create.
 * @param target - An optional object to use as the starting point for creation.
 *                 If not provided, the global object (`Global`) is used.
 * @returns The final object created at the specified path.
 */
export const forge = <T extends string[]>(parts: T, target?: {}): { [ K in T[number]]: {}} => {
  let o = target !== undefined ? target : Global;
  for (let i = 0; i < parts.length; ++i) {
    o = step(o, parts[i]);
  }
  return o;
};

/**
 * Creates a nested object structure based on a dot-separated string path, initializing missing properties to empty objects.
 *
 * @param name - A dot-separated string representing the path of keys to create.
 * @param target - An optional object to use as the starting point for creation.
 *                 If not provided, the global object (`Global`) is used.
 * @returns The final object created at the specified path.
 */
export const namespace = (name: string, target?: {}): { [key: string]: {}} => {
  const parts = name.split('.');
  return forge(parts, target);
};
