import { Adt } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

// Snappables use an option for the coord and then pass it to absorb below
// so "T" here should either be a `number` or an `(number) | null`
export type DragCoords<T = number, U = CoordAdt<T>> = (x: T, y: T) => U;

export interface CoordAdt<T = number> {
  fold: <U>(
    offset: DragCoords<T, U>,
    absolute: DragCoords<T, U>,
    fixed: DragCoords<T, U>,
  ) => U;
  match: <U>(branches: {
    offset: DragCoords<T, U>;
    absolute: DragCoords<T, U>;
    fixed: DragCoords<T, U>;
  }) => U;
  log: (label: string) => void;
}

// Note: Need to use a type here, as types are iterable whereas interfaces are not
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type StylesCoord = {
  left: (string) | null;
  right: (string) | null;
  top: (string) | null;
  bottom: (string) | null;
  position: (string) | null;
};

type CoordTransform = (coords: SugarPosition) => SugarPosition;

export type CoordStencil = (coord: CoordAdt<number>, scroll: SugarPosition, origin: SugarPosition) => SugarPosition;
/*
 * origin: the position (without scroll) of the offset parent
 * scroll: the scrolling position of the window
 *
 * fixed: the fixed coordinates to show for css
 * offset: the absolute coordinates to show for css when inside an offset parent
 * absolute: the absolute coordinates to show before considering the offset parent
 */
const adt: {
  offset: DragCoords<number | (number) | null>;
  absolute: DragCoords<number | (number) | null>;
  fixed: DragCoords<number | (number) | null>;
} = Adt.generate([
  { offset: [ 'x', 'y' ] },
  { absolute: [ 'x', 'y' ] },
  { fixed: [ 'x', 'y' ] }
]);

const subtract = (change: SugarPosition): CoordTransform => (point) => point.translate(-change.left, -change.top);

const add = (change: SugarPosition): CoordTransform => (point) => point.translate(change.left, change.top);

const transform = (changes: CoordTransform[]) => (x: number, y: number): SugarPosition => (changes).reduce((rest, f) => f(rest), SugarPosition(x, y));

const asFixed: CoordStencil = (coord: CoordAdt<number>, scroll: SugarPosition, origin: SugarPosition) => coord.fold(
  // offset to fixed
  transform([ add(origin), subtract(scroll) ]),
  // absolute to fixed
  transform([ subtract(scroll) ]),
  // fixed to fixed
  transform([ ])
);

const asAbsolute: CoordStencil = (coord: CoordAdt<number>, scroll: SugarPosition, origin: SugarPosition) => coord.fold(
  // offset to absolute
  transform([ add(origin) ]),
  // absolute to absolute
  transform([ ]),
  // fixed to absolute
  transform([ add(scroll) ])
);

const asOffset: CoordStencil = (coord: CoordAdt<number>, scroll: SugarPosition, origin: SugarPosition) => coord.fold(
  // offset to offset
  transform([ ]),
  // absolute to offset
  transform([ subtract(origin) ]),
  // fixed to offset
  transform([ add(scroll), subtract(origin) ])
);

const toString = (coord: CoordAdt<number>): string => coord.fold(
  (x, y) => 'offset(' + x + ', ' + y + ')',
  (x, y) => 'absolute(' + x + ', ' + y + ')',
  (x, y) => 'fixed(' + x + ', ' + y + ')'
);

const withinRange = (coord1: CoordAdt<number>, coord2: CoordAdt<number>, xRange: number, yRange: number, scroll: SugarPosition, origin: SugarPosition): boolean => {
  const a1 = asAbsolute(coord1, scroll, origin);
  const a2 = asAbsolute(coord2, scroll, origin);
  // eslint-disable-next-line no-console
  // console.log(`a1.left: ${a1.left}, a2.left: ${a2.left}, leftDelta: ${a1.left - a2.left}, xRange: ${xRange}, lD <= xRange: ${Math.abs(a1.left - a2.left) <= xRange}`);
  // console.log(`a1.top: ${a1.top}, a2.top: ${a2.top}, topDelta: ${a1.top - a2.top}, yRange: ${yRange}, lD <= xRange: ${Math.abs(a1.top - a2.top) <= yRange}`);
  return Math.abs(a1.left - a2.left) <= xRange &&
    Math.abs(a1.top - a2.top) <= yRange;
};

const getDeltas = (coord1: CoordAdt<number>, coord2: CoordAdt<number>, xRange: number, yRange: number, scroll: SugarPosition, origin: SugarPosition): SugarPosition => {
  const a1 = asAbsolute(coord1, scroll, origin);
  const a2 = asAbsolute(coord2, scroll, origin);
  const left = Math.abs(a1.left - a2.left);
  const top = Math.abs(a1.top - a2.top);
  return SugarPosition(left, top);
};

const toStyles = (coord: CoordAdt<number>, scroll: SugarPosition, origin: SugarPosition): StylesCoord => {
  const stylesOpt = coord.fold(
    (x, y) =>
      ({ position: 'absolute', left: x + 'px', top: y + 'px' }), // offset
    (x, y) =>
      ({ position: 'absolute', left: (x - origin.left) + 'px', top: (y - origin.top) + 'px' }), // absolute
    (x, y) =>
      ({ position: 'fixed', left: x + 'px', top: y + 'px' }) // fixed
  );

  return { right: null, bottom: null, ...stylesOpt };
};

const translate = (coord: CoordAdt<number>, deltaX: number, deltaY: number): CoordAdt<number> => coord.fold(
  (x, y) => offset(x + deltaX, y + deltaY),
  (x, y) => absolute(x + deltaX, y + deltaY),
  (x, y) => fixed(x + deltaX, y + deltaY)
);

const absorb = (partialCoord: CoordAdt<(number) | null>, originalCoord: CoordAdt<number>, scroll: SugarPosition, origin: SugarPosition): CoordAdt<number> => {
  const absorbOne = (stencil: CoordStencil, nu: DragCoords) => (optX: (number) | null, optY: (number) | null): CoordAdt => {
    const original = stencil(originalCoord, scroll, origin);
    return nu(optX ?? (original.left), optY ?? (original.top));
  };

  return partialCoord.fold(
    absorbOne(asOffset, offset),
    absorbOne(asAbsolute, absolute),
    absorbOne(asFixed, fixed)
  );
};

const offset = adt.offset as {
  (x: number, y: number): CoordAdt<number>;
  (x: (number) | null, y: (number) | null): CoordAdt<(number) | null>;
};
const absolute = adt.absolute as {
  (x: number, y: number): CoordAdt<number>;
  (x: (number) | null, y: (number) | null): CoordAdt<(number) | null>;
};
const fixed = adt.fixed as {
  (x: number, y: number): CoordAdt<number>;
  (x: (number) | null, y: (number) | null): CoordAdt<(number) | null>;
};

export {
  offset,
  absolute,
  fixed,

  asFixed,
  asAbsolute,
  asOffset,
  withinRange,
  getDeltas,
  toStyles,
  translate,

  absorb,
  toString
};
