import { Fun } from "@hugerte/katamari";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Positioning } from "hugerte/alloy/api/behaviour/Positioning";
import { AlloyComponent } from "hugerte/alloy/api/component/ComponentApi";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import { Container } from "hugerte/alloy/api/ui/Container";

const make = (): AlloyComponent => GuiFactory.build(
  Container.sketch({
    containerBehaviours: Behaviour.derive([
      Positioning.config({
        useFixed: Fun.always
      })
    ])
  })
);

export {
  make
};
