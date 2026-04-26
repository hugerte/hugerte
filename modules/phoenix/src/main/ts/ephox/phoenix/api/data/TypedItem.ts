import { Universe } from '@ephox/boss';
import { Adt, Fun } from '@ephox/katamari';

type Handler<E, D, U> = (item: E, universe: Universe<E, D>) => U;

interface TypedItemAdt<E, D> {
  fold: <U> (
    onBoundary: Handler<E, D, U>,
    onEmpty: Handler<E, D, U>,
    onText: Handler<E, D, U>,
    onNonEditable: Handler<E, D, U>
  ) => U;
  match: <U> (branches: {
    boundary: Handler<E, D, U>;
    empty: Handler<E, D, U>;
    text: Handler<E, D, U>;
    nonEditable: Handler<E, D, U>;
  }) => U;
  log: (label: string) => void;
}

export interface TypedItem<E, D> extends TypedItemAdt<E, D> {
  isBoundary(): boolean;
  toText(): (E) | null;
  is(other: E): boolean;
  len(): number;
}

type TypedItemAdtConstructor = <E, D>(item: E, universe: Universe<E, D>) => TypedItemAdt<E, D>;

const adt: {
  boundary: TypedItemAdtConstructor;
  empty: TypedItemAdtConstructor;
  text: TypedItemAdtConstructor;
  nonEditable: TypedItemAdtConstructor;
} = Adt.generate([
  { boundary: [ 'item', 'universe' ] },
  { empty: [ 'item', 'universe' ] },
  { text: [ 'item', 'universe' ] },
  { nonEditable: [ 'item', 'universe' ] }
]);

const no = (() => false as const);
const yes = (() => true as const);
const zero = () => 0;
const one = () => 1;

const ext = <E, D>(ti: TypedItemAdt<E, D>): TypedItem<E, D> => ({
  ...ti,
  isBoundary: () => ti.fold(yes, no, no, no),
  toText: () => ti.fold<(E) | null>(() => null, () => null, (i) => i, () => null),
  is: (other) => ti.fold(no, no, (i, u) => u.eq(i, other), no),
  len: () => ti.fold(zero, one, (i, u) => u.property().getText(i).length, one)
});

type TypedItemConstructor = <E, D>(item: E, universe: Universe<E, D>) => TypedItem<E, D>;

// currently Fun.compose does not create the correct output type for functions with generic types
const text = ((x: any) => (ext as any)((adt.text as any)(x))) as TypedItemConstructor;
const boundary = ((x: any) => (ext as any)((adt.boundary as any)(x))) as TypedItemConstructor;
const empty = ((x: any) => (ext as any)((adt.empty as any)(x))) as TypedItemConstructor;
const nonEditable = ((x: any) => (ext as any)((adt.empty as any)(x))) as TypedItemConstructor;

const cata = <E, D, U>(subject: TypedItem<E, D>, onBoundary: Handler<E, D, U>, onEmpty: Handler<E, D, U>, onText: Handler<E, D, U>, onNonEditable: Handler<E, D, U>): U => {
  return subject.fold(onBoundary, onEmpty, onText, onNonEditable);
};

export const TypedItem = {
  text,
  boundary,
  empty,
  nonEditable,
  cata
};
