import { ItemTypes } from "@hugerte/alloy";
import { Menu } from "@hugerte/bridge";
import { Obj, Optional } from "@hugerte/katamari";

import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import { renderColorSwatchItem } from './ColorSwatchItem';
import { renderInsertTableMenuItem } from './InsertTableMenuItem';

const fancyMenuItems: Record<keyof Menu.FancyActionArgsMap, (mi: any, bs: UiFactoryBackstage) => ItemTypes.WidgetItemSpec> = {
  inserttable: renderInsertTableMenuItem,
  colorswatch: renderColorSwatchItem
};

const renderFancyMenuItem = (spec: Menu.FancyMenuItem, backstage: UiFactoryBackstage): Optional<ItemTypes.WidgetItemSpec> =>
  Obj.get(fancyMenuItems, spec.fancytype).map((render) => render(spec, backstage));

export {
  renderFancyMenuItem
};
