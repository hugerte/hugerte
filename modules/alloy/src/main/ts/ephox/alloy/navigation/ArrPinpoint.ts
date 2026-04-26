
export interface IndexInfo<A> {
  readonly index: number;
  readonly candidates: A[];
}

export const locate = <A> (candidates: A[], predicate: (a: A) => boolean): (IndexInfo<A>) | null => (candidates).findIndex(predicate).map((index) => ({
  index,
  candidates
}));
