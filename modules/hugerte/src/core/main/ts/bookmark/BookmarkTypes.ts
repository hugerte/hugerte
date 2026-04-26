
import Tools from '../api/util/Tools';

export interface StringPathBookmark {
  start: string;
  end?: string;
  forward?: boolean;
}

export interface RangeBookmark {
  rng: Range;
  forward?: boolean;
}

export interface IdBookmark {
  id: string;
  keep?: boolean;
  forward?: boolean;
}

export interface IndexBookmark {
  name: string;
  index: number;
}

export interface PathBookmark {
  start: number[];
  end?: number[];
  isFakeCaret?: boolean;
  forward?: boolean;
}

export type Bookmark = StringPathBookmark | RangeBookmark | IdBookmark | IndexBookmark | PathBookmark;

const isStringPathBookmark = (bookmark: Bookmark): bookmark is StringPathBookmark => typeof ((bookmark as StringPathBookmark).start) === 'string';

const isRangeBookmark = (bookmark: Bookmark): bookmark is RangeBookmark => Object.prototype.hasOwnProperty.call(bookmark as RangeBookmark, 'rng');

const isIdBookmark = (bookmark: Bookmark): bookmark is IdBookmark => Object.prototype.hasOwnProperty.call(bookmark as IdBookmark, 'id');

const isIndexBookmark = (bookmark: Bookmark): bookmark is IndexBookmark => Object.prototype.hasOwnProperty.call(bookmark as IndexBookmark, 'name');

const isPathBookmark = (bookmark: Bookmark): bookmark is PathBookmark => Tools.isArray((bookmark as PathBookmark).start);

export {
  isStringPathBookmark,
  isRangeBookmark,
  isIdBookmark,
  isIndexBookmark,
  isPathBookmark
};
