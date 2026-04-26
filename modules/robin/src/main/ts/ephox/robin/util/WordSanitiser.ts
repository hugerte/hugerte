
import { WordScope } from '../data/WordScope';

const quoteList = [ `'`, '\u2018', '\u2019' ];
const whitelist = (quoteList).flatMap((q) => {
  return ([ 'twas' ]).map((t) => {
    return q + t;
  });
});

const trimStart = (ws: WordScope): WordScope => {
  const word = ws.word;
  return WordScope(word.substring(1), word.charAt(0), ws.right);
};

const trimEnd = (ws: WordScope): WordScope => {
  const word = ws.word;
  return WordScope(word.substring(0, word.length - 1), ws.left, word.charAt(word.length - 1));
};

const isQuote = (s: string): boolean => {
  return (quoteList).includes(s);
};

const rhs = (ws: WordScope): WordScope => {
  const word = ws.word;
  const trailing = word.length >= 2 && isQuote(word.charAt(word.length - 1)) && !isQuote(word.charAt(word.length - 2));
  return trailing ? trimEnd(ws) : ws;
};

const lhs = (ws: WordScope): WordScope => {
  const word = ws.word;
  const whitelisted = (whitelist).some((x) => {
    return word.indexOf(x) > -1;
  });

  const apostrophes = whitelisted ? 2 : 1;
  const quoted = word.substring(0, apostrophes);

  const leading = (quoted).every(isQuote) && !isQuote(word.charAt(apostrophes));

  return leading ? trimStart(ws) : ws;
};

/**
 * If there are quotes at the edges of the WordScope, this determines if they are part of the word
 *
 * ws: WordScope
 */
const scope = (ws: WordScope): WordScope => {
  const r = rhs(ws);
  return lhs(r);
};

/**
 * Extracts the actual word from the text using scope()
 */
const text = (word: string): string => {
  const ws = WordScope(word, null, null);
  const r = scope(ws);
  return r.word;
};

export {
  scope,
  text
};
