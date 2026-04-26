
import { BeforeAfter } from '../data/BeforeAfter';
import * as WordUtil from './WordUtil';

/*
 * Returns an optional before and optional after representing the index positions of the nearest
 * breaks around position in text. Note, that a substring from before to after should represent
 * the word that position is in (when they are set). A value of none for either before or after suggests
 * that there were no breaks in the respective direction from position in text. The before and the
 * after values will be equal if position is at the start or the end of a word.
 */
const around = (text: string, position: number): BeforeAfter => {
  const first = text.substring(0, position);
  const before = WordUtil.leftBreak(first).map((index) => {
    return index + 1;
  });
  const last = text.substring(position);
  const after = WordUtil.rightBreak(last).map((index) => {
    return position + index;
  });

  const fallback = BeforeAfter(before, after);

  const current = BeforeAfter(position, position);

  const endOfWord = after.bind((a) => (position === a ? current : null));

  return endOfWord.getOrThunk(() =>
    before.bind((b) => (position === b ? current : null)) ?? (fallback));
};

export {
  around
};
