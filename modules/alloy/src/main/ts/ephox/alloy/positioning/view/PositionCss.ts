import { Css, SugarElement } from '@ephox/sugar';

export interface PositionCss {
  readonly position: string;
  readonly left: (string) | null;
  readonly top: (string) | null;
  readonly right: (string) | null;
  readonly bottom: (string) | null;
}

const NuPositionCss = (
  position: string,
  left: (number) | null,
  top: (number) | null,
  right: (number) | null,
  bottom: (number) | null
): PositionCss => {
  const toPx = (num: number) => num + 'px';
  return {
    position,
    left: left.map(toPx),
    top: top.map(toPx),
    right: right.map(toPx),
    bottom: bottom.map(toPx)
  };
};

const toOptions = (position: PositionCss): Record<string, (string) | null> => ({
  ...position,
  position: position.position
});

const applyPositionCss = (element: SugarElement<HTMLElement>, position: PositionCss): void => {
  Css.setOptions(element, toOptions(position));
};

export {
  NuPositionCss,
  applyPositionCss
};
