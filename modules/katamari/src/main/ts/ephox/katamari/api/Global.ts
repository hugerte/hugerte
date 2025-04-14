// Use window object as the global if it's available since CSP will block script evals
// eslint-disable-next-line @typescript-eslint/no-implied-eval
// TODO: I'd like to migrate to globalThis but it breaks Resolve.ts.
export const Global = typeof window !== 'undefined' ? window : Function('return this;')();
