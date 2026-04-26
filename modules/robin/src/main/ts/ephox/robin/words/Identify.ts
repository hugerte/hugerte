import { Words } from '@ephox/polaris';

import { WordScope } from '../data/WordScope';
import * as WordSanitiser from '../util/WordSanitiser';

// Returns: [array of WordScope Struct] containing all words from string allText
const words = (allText: string): WordScope[] => {
  const { words, indices } = Words.getWordsWithIndices(allText.split(''), (x: any) => x);
  const len = allText.length;

  return (words).map((word, i) => {
    const index = indices[i];
    const start = index.start;
    const end = index.end;
    const text = word.join('');
    const prev = start > 0 ? allText.charAt(start - 1) : null;
    const next = end < len ? allText.charAt(end) : null;
    const r = WordScope(text, prev, next);
    return WordSanitiser.scope(r);
  });
};

export {
  words
};
