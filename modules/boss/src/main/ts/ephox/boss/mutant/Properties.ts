
import { Gene } from '../api/Gene';
import TagBoundaries from '../common/TagBoundaries';

// Warning: not exhaustive
export const enum GeneTypes {
  Text = 'TEXT_GENE',
  Comment = 'COMMENT_GENE',
  Special = 'SPECIAL_GENE'
}

const children = (item: Gene): Gene[] => {
  return item.children;
};

const name = (item: Gene): string => {
  return item.name;
};

const parent = (item: Gene): (Gene) | null => {
  return item.parent;
};

const document = (_item: Gene): undefined => {
  return undefined; // currently the test universe does not have documents
};

const isText = (item: Gene): boolean => {
  return item.name === GeneTypes.Text;
};

const isComment = (item: Gene): boolean => {
  return item.name === GeneTypes.Comment;
};

const isElement = (item: Gene): boolean => {
  return item.name !== undefined && item.name !== GeneTypes.Text && item.name !== GeneTypes.Comment;
};

const isSpecial = (item: Gene): boolean => {
  return item.name === GeneTypes.Special;
};

const getLanguage = (item: Gene): (string) | null =>
  ((item.attrs)['lang'] ?? null);

const getText = (item: Gene): string => {
  return (item.text ?? null).getOrDie('Text not available on this node');
};

const setText = (item: Gene, value: string | undefined): void => {
  item.text = value;
};

const isEmptyTag = (item: Gene): boolean => {
  return ([ 'br', 'img', 'hr' ]).includes(item.name);
};

const isBoundary = (item: Gene): boolean => {
  return (TagBoundaries).includes(item.name);
};

const isNonEditable = (item: Gene): boolean => {
  return isElement(item) && item.attrs.contenteditable === 'false';
};

export {
  children,
  name,
  parent,
  document,
  isText,
  isComment,
  isElement,
  isSpecial,
  getLanguage,
  getText,
  setText,
  isEmptyTag,
  isBoundary,
  isNonEditable
};
