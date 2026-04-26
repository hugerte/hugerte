
export interface WordScope {
  readonly word: string;
  readonly left: (string) | null;
  readonly right: (string) | null;
}

export const WordScope = (word: string, left: (string) | null, right: (string) | null): WordScope => ({
  word,
  left,
  right
});
