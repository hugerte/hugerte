import { Assertions, Chain, Logger, Step, UiFinder } from "@hugerte/agar";
import { Css, Width } from "@hugerte/sugar";

import { AlloyComponent } from "hugerte/alloy/api/component/ComponentApi";
import { GuiSystem } from "hugerte/alloy/api/system/Gui";

const sSameWidth = <T>(label: string, gui: GuiSystem, dropdown: AlloyComponent, menuSelector: string): Step<T, T> =>
  Logger.t(
    label + '\nChecking that the hotspot width is passed onto the menu width',
    Chain.asStep(gui.element, [
      UiFinder.cFindIn(menuSelector),
      Chain.op((menu) => {
        const dropdownWidth = Width.get(dropdown.element);
        const menuWidth = parseInt(
          Css.getRaw(menu, 'width').getOrDie('Menu must have a width property'),
          10
        );

        Assertions.assertEq(
          'Check that the menu width is approximately the same as the hotspot width',
          true,
          Math.abs(menuWidth - dropdownWidth) < 20
        );
      })
    ])
  );

export {
  sSameWidth
};
