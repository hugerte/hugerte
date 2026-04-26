import { Pattern, Search } from '@ephox/polaris';

const wordstart = new RegExp(Pattern.wordbreak() + '+', 'g');

const zero = () => 0;

/**
 * Returns optional text after the last word break character
 */
const lastWord = (text: string): (string) | null => {
  return leftBreak(text).map((index) => {
    return text.substring(index);
  });
};

/**
 * Returns optional text up to the first word break character
 */
const firstWord = (text: string): (string) | null => {
  return rightBreak(text).map((index) => {
    return text.substring(0, index + 1);
  });
};

/*
 * Returns the index position of a break when going left (i.e. last word break)
 */
const leftBreak = (text: string): (number) | null => {
  const indices = Search.findall(text, Pattern.custom(Pattern.wordbreak(), zero, zero, null));
  return (indices[indices.length - 1] ?? null).map((match) => {
    return match.start;
  });
};

/*
 * Returns the index position of a break when going right (i.e. first word break)
 */
const rightBreak = (text: string): (number) | null => {
  // ASSUMPTION: search is sufficient because we only need to find the first one.
  const index = text.search(wordstart);
  return index > -1 ? index : null;
};

const hasBreak = (text: string): boolean => {
  return rightBreak(text) !== null;
};

export {
  firstWord,
  lastWord,
  leftBreak,
  rightBreak,
  hasBreak
};
