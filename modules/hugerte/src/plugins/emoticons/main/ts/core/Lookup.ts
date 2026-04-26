
import { EmojiEntry } from './EmojiDatabase';

const emojiMatches = (emoji: EmojiEntry, lowerCasePattern: string): boolean =>
  (emoji.title.toLowerCase()).includes(lowerCasePattern) ||
  (emoji.keywords).some((k) => (k.toLowerCase()).includes(lowerCasePattern));

const emojisFrom = (list: EmojiEntry[], pattern: string, maxResults: (number) | null): Array<{ value: string; icon: string; text: string }> => {
  const matches = [];
  const lowerCasePattern = pattern.toLowerCase();
  const reachedLimit = maxResults.fold(() => (() => false as const), (max) => (size) => size >= max);
  for (let i = 0; i < list.length; i++) {
    // TODO: more intelligent search by showing title matches at the top, keyword matches after that (use two arrays and concat at the end)
    if (pattern.length === 0 || emojiMatches(list[i], lowerCasePattern)) {
      matches.push({
        value: list[i].char,
        text: list[i].title,
        icon: list[i].char
      });
      if (reachedLimit(matches.length)) {
        break;
      }
    }
  }
  return matches;
};

export {
  emojisFrom
};
