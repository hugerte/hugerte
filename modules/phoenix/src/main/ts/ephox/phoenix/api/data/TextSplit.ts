
export interface TextSplit<E> {
  readonly before: (E) | null;
  readonly after: (E) | null;
}

export const TextSplit = <E>(before: (E) | null, after: (E) | null): TextSplit<E> => ({
  before,
  after
});
