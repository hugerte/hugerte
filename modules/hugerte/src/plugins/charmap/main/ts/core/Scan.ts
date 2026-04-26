
import { CharMap, Char } from './CharMap';

export interface CharItem {
  readonly value: string;
  readonly icon: string;
  readonly text: string;
}

const charMatches = (charCode: number, name: string, lowerCasePattern: string): boolean => {
  if ((String.fromCodePoint(charCode).toLowerCase()).includes(lowerCasePattern)) {
    return true;
  } else {
    return (name.toLowerCase()).includes(lowerCasePattern) || (name.toLowerCase().replace(/\s+/g, '')).includes(lowerCasePattern);
  }
};

const scan = (group: CharMap, pattern: string): CharItem[] => {
  const matches: Char[] = [];
  const lowerCasePattern = pattern.toLowerCase();
  (group.characters).forEach((g) => {
    if (charMatches(g[0], g[1], lowerCasePattern)) {
      matches.push(g);
    }
  });

  return (matches).map((m) => ({
    text: m[1],
    value: String.fromCodePoint(m[0]),
    icon: String.fromCodePoint(m[0])
  }));
};

export {
  scan
};
