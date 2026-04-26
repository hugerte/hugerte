

import LocalStorage from 'hugerte/core/api/util/LocalStorage';

const STORAGE_KEY = 'hugerte-url-history';
const HISTORY_LENGTH = 5;

// validation functions
const isHttpUrl = (url: any): boolean => typeof (url) === 'string' && /^https?/.test(url);

const isArrayOfUrl = (a: any): boolean => Array.isArray(a) && a.length <= HISTORY_LENGTH && (a).every(isHttpUrl);

const isRecordOfUrlArray = (r: any): boolean => (typeof (r) === 'object' && (r) !== null) && (Object.values(r) as any[]).find((v) => ((value) => !isArrayOfUrl(value))(v, '')) ?? null === null;

const getAllHistory = (): Record<string, string[]> => {
  const unparsedHistory = LocalStorage.getItem(STORAGE_KEY);
  if (unparsedHistory === null) {
    return {};
  }
  // parse history
  let history;
  try {
    history = JSON.parse(unparsedHistory);
  } catch (e) {
    if (e instanceof SyntaxError) {
      // eslint-disable-next-line no-console
      console.log('Local storage ' + STORAGE_KEY + ' was not valid JSON', e);
      return {};
    }
    throw e;
  }
  // validate the parsed value
  if (!isRecordOfUrlArray(history)) {
    // eslint-disable-next-line no-console
    console.log('Local storage ' + STORAGE_KEY + ' was not valid format', history);
    return {};
  }
  return history;
};

const setAllHistory = (history: Record<string, string[]>) => {
  if (!isRecordOfUrlArray(history)) {
    throw new Error('Bad format for history:\n' + JSON.stringify(history));
  }
  LocalStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

const getHistory = (fileType: string): string[] => {
  const history = getAllHistory();
  return ((history)[fileType] ?? null) ?? ([]);
};

const addToHistory = (url: string, fileType: string): void => {
  if (!isHttpUrl(url)) {
    return;
  }
  const history = getAllHistory();
  const items = ((history)[fileType] ?? null) ?? ([]);
  const itemsWithoutUrl = (items).filter((item) => item !== url);
  history[fileType] = [ url ].concat(itemsWithoutUrl).slice(0, HISTORY_LENGTH);
  setAllHistory(history);
};

const clearHistory = (): void => {
  LocalStorage.removeItem(STORAGE_KEY);
};

export {
  getHistory,
  addToHistory,
  clearHistory
};
