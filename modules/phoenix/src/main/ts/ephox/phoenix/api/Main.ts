import * as Seeker from '../gather/Seeker'; // robin is using this directly
import { InjectPosition } from './data/InjectPosition';
import { NamedPattern } from './data/NamedPattern';
import { SplitPosition } from './data/SplitPosition';
import * as Spot from './data/Spot';
import { TextSplit } from './data/TextSplit';
import { TypedItem } from './data/TypedItem';
import {
  Direction, SearchResult, SpanWrapRange, SpotDelta, SpotPoint, SpotPoints, SpotRange, SpotText, Successor, Transition, Traverse, Wrapter
} from './data/Types';
import * as DomDescent from './dom/DomDescent';
import * as DomGather from './dom/DomGather';
import * as Descent from './general/Descent';
import * as Gather from './general/Gather';
import * as Split from './general/Split';

export {
  InjectPosition,
  NamedPattern,
  SplitPosition,
  Spot,
  TextSplit,
  TypedItem,
  SpotPoint,
  SpotDelta,
  SpotRange,
  SpotPoints,
  SpotText,
  SearchResult,
  Direction,
  Transition,
  Traverse,
  Successor,
  Wrapter,
  SpanWrapRange,
  DomDescent,
  DomGather,
  Descent,
  Gather,
  Split,
  Seeker
};
