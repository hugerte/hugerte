import { ItemTypes } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';

import { UiFactoryBackstage } from '../../../../backstage/Backstage';
import { renderColorSwatchItem } from './ColorSwatchItem';
import { renderInsertTableMenuItem } from './InsertTableMenuItem';

const fancyMenuItems: Record<keyof Menu.FancyActionArgsMap, (mi: any, bs: UiFactoryBackstage) => ItemTypes.WidgetItemSpec> = {
  inserttable: renderInsertTableMenuItem,
  colorswatch: renderColorSwatchItem
};

const renderFancyMenuItem = (spec: Menu.FancyMenuItem, backstage: UiFactoryBackstage): (ItemTypes.WidgetItemSpec) | null =>
  ((fancyMenuItems)[spec.fancytype] ?? null).map((render) => render(spec, backstage));

export {
  renderFancyMenuItem
};
