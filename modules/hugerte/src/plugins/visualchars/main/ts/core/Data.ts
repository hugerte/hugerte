
type CharMap = Record<string, string>;

export const charMap: CharMap = {
  '\u00a0': 'nbsp',
  '\u00ad': 'shy'
};

export const charMapToRegExp = (charMap: CharMap, global?: boolean): RegExp => {
  let regExp = '';

  Object.entries(charMap).forEach(([_k, _v]: [any, any]) => ((_value, key) => {
    regExp += key;
  })(_v, _k));

  return new RegExp('[' + regExp + ']', global ? 'g' : '');
};

export const charMapToSelector = (charMap: CharMap): string => {
  let selector = '';
  Object.entries(charMap).forEach(([_k, _v]: [any, any]) => ((value) => {
    if (selector) {
      selector += ',';
    }
    selector += 'span.mce-' + value;
  })(_v, _k));

  return selector;
};

export const regExp = charMapToRegExp(charMap);
export const regExpGlobal = charMapToRegExp(charMap, true);
export const selector = charMapToSelector(charMap);
export const nbspClass = 'mce-nbsp';
