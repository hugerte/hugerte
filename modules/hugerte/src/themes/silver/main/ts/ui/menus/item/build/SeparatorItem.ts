import { GuiFactory, ItemTypes } from "@hugerte/alloy";
import { Menu } from "@hugerte/bridge";

import * as ItemClasses from '../ItemClasses';

const renderSeparatorItem = (spec: Menu.SeparatorMenuItem): ItemTypes.ItemSpec => ({
  type: 'separator',
  dom: {
    tag: 'div',
    classes: [ ItemClasses.selectableClass, ItemClasses.groupHeadingClass ]
  },
  components: spec.text.map(GuiFactory.text).toArray()
});

export {
  renderSeparatorItem
};
