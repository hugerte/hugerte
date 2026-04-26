
interface KeyPatternBase {
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  keyCode?: number;
}

export interface KeyPattern extends KeyPatternBase {
  action: () => boolean;
}
export interface KeyPatternDelayed extends KeyPatternBase {
  action: () => (() => void) | null;
}

const baseKeyPattern = {
  shiftKey: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  keyCode: 0
};

const defaultPatterns = (patterns: KeyPattern[]): Required<KeyPattern>[] =>
  (patterns).map((pattern) => ({
    ...baseKeyPattern,
    ...pattern
  }));

const defaultDelayedPatterns = (patterns: KeyPatternDelayed[]): Required<KeyPatternDelayed>[] =>
  (patterns).map((pattern) => ({
    ...baseKeyPattern,
    ...pattern
  }));

const matchesEvent = <T extends KeyPatternBase>(pattern: T, evt: KeyboardEvent) => (
  evt.keyCode === pattern.keyCode &&
  evt.shiftKey === pattern.shiftKey &&
  evt.altKey === pattern.altKey &&
  evt.ctrlKey === pattern.ctrlKey &&
  evt.metaKey === pattern.metaKey
);

const match = (patterns: KeyPattern[], evt: KeyboardEvent): Required<KeyPattern>[] =>
  (defaultPatterns(patterns)).flatMap((pattern) => matchesEvent(pattern, evt) ? [ pattern ] : [ ]);

const matchDelayed = (patterns: KeyPatternDelayed[], evt: KeyboardEvent): Required<KeyPatternDelayed>[] =>
  (defaultDelayedPatterns(patterns)).flatMap((pattern) => matchesEvent(pattern, evt) ? [ pattern ] : [ ]);

const action = <T extends (...args: any[]) => any>(f: T, ...x: Parameters<T>) => (): ReturnType<T> => f.apply(null, x);

const execute = (patterns: KeyPattern[], evt: KeyboardEvent): (Required<KeyPattern>) | null =>
  ((match(patterns, evt)).find((pattern) => pattern.action()) ?? null);

const executeWithDelayedAction = (patterns: KeyPatternDelayed[], evt: KeyboardEvent): (() => void) | null =>
  ((matchDelayed(patterns, evt)) as any[]).reduce<any>((acc: any, x: any) => acc !== null ? acc : ((pattern) => pattern.action())(x), null);

export {
  match,
  action,
  execute,
  executeWithDelayedAction
};
