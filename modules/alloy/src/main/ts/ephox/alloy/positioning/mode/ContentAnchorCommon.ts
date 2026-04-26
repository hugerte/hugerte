import { SugarElement, SugarPosition } from '@ephox/sugar';

import * as Boxes from '../../alien/Boxes';
import * as CssPosition from '../../alien/CssPosition';
import * as Bubble from '../layout/Bubble';
import * as Layout from '../layout/Layout';
import * as Origins from '../layout/Origins';
import { Anchoring, NodeAnchor, nu as NuAnchor, SelectionAnchor } from './Anchoring';
import * as AnchorLayouts from './AnchorLayouts';

const getBox = (left: number, top: number, width: number, height: number): (Boxes.BoxByPoint) | null => {
  const point = CssPosition.screen(SugarPosition(left, top));
  return Boxes.pointed(point, width, height);
};

const calcNewAnchor = (optBox: (Boxes.BoxByPoint) | null, rootPoint: CssPosition.CssPositionAdt, anchorInfo: SelectionAnchor | NodeAnchor, origin: Origins.OriginAdt, elem: SugarElement<Element>): (Anchoring) | null =>
  optBox.map((box) => {
    const points = [ rootPoint, box.point ];
    const topLeft = Origins.cata(origin,
      () => CssPosition.sumAsAbsolute(points),
      () => CssPosition.sumAsAbsolute(points),
      () => CssPosition.sumAsFixed(points)
    );

    const anchorBox = Boxes.rect(
      topLeft.left,
      topLeft.top,
      box.width,
      box.height
    );

    const layoutsLtr = anchorInfo.showAbove ?
      Layout.aboveOrBelow() :
      Layout.belowOrAbove();

    const layoutsRtl = anchorInfo.showAbove ?
      Layout.aboveOrBelowRtl() :
      Layout.belowOrAboveRtl();

    const layouts = AnchorLayouts.get(
      elem,
      anchorInfo,
      layoutsLtr,
      layoutsRtl,
      layoutsLtr,
      layoutsRtl,
      null
    );

    return NuAnchor({
      anchorBox,
      bubble: anchorInfo.bubble ?? (Bubble.fallback()),
      overrides: anchorInfo.overrides,
      layouts
    });
  });

export {
  getBox,
  calcNewAnchor
};
