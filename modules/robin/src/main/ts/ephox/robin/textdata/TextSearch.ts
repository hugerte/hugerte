
export interface CharPos {
  readonly ch: string;
  readonly offset: number;
}

const charpos = (ch: string, offset: number): CharPos => ({
  ch,
  offset
});

const locate = (text: string, offset: number): CharPos =>
  charpos(text.charAt(offset), offset);

const getMatchIndex = (match: RegExpMatchArray | null): (number) | null =>
  (match) != null && match.index !== undefined && match.index >= 0 ? match.index : null;

const previous = (text: string, offsetOption: (number) | null): (CharPos) | null => {
  const max = offsetOption ?? (text.length);
  for (let i = max - 1; i >= 0; i--) {
    if (text.charAt(i) !== '\uFEFF') {
      return locate(text, i);
    }
  }
  return null;
};

const next = (text: string, offsetOption: (number) | null): (CharPos) | null => {
  const min = offsetOption ?? (0);
  for (let i = min + 1; i < text.length; i++) {
    if (text.charAt(i) !== '\uFEFF') {
      return locate(text, i);
    }
  }
  return null;
};

const rfind = (str: string, regex: RegExp): (number) | null => {
  regex.lastIndex = -1;
  const reversed = [...(str)].reverse().join('');
  return getMatchIndex(reversed.match(regex)).map((index) => (reversed.length - 1) - index);
};

const lfind = (str: string, regex: RegExp): (number) | null => {
  regex.lastIndex = -1;
  return getMatchIndex(str.match(regex));
};

export {
  previous,
  next,
  rfind,
  lfind
};
