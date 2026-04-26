import { Adt } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

export interface CssPositionAdt {
  fold: <T> (
    screen: (point: SugarPosition) => T,
    absolute: (point: SugarPosition, sx: number, sy: number) => T
  ) => T;
  match: <T> (branches: {
    screen: (point: SugarPosition) => T;
    absolute: (point: SugarPosition, sx: number, sy: number) => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  screen: (point: SugarPosition) => CssPositionAdt;
  absolute: (point: SugarPosition, sx: number, sy: number) => CssPositionAdt;
} = Adt.generate([
  { screen: [ 'point' ] },
  { absolute: [ 'point', 'scrollLeft', 'scrollTop' ] }
]);

const toFixed = (pos: CssPositionAdt): SugarPosition =>
  // TODO: Use new ADT methods
  pos.fold(
    (x: any) => x,
    (point, scrollLeft, scrollTop) => point.translate(-scrollLeft, -scrollTop)
  );

const toAbsolute = (pos: CssPositionAdt): SugarPosition => pos.fold((x: any) => x, (x: any) => x);

const sum = (points: SugarPosition[]): SugarPosition => (points).reduce((b, a) => b.translate(a.left, a.top), SugarPosition(0, 0));

const sumAsFixed = (positions: CssPositionAdt[]): SugarPosition => {
  const points = (positions).map(toFixed);
  return sum(points);
};

const sumAsAbsolute = (positions: CssPositionAdt[]): SugarPosition => {
  const points = (positions).map(toAbsolute);
  return sum(points);
};

const screen = adt.screen;
const absolute = adt.absolute;

export {
  sumAsFixed,
  sumAsAbsolute,
  screen,
  absolute
};
