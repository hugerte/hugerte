import { Fun } from '@hugemce/katamari';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Positioning } from 'hugemce/alloy/api/behaviour/Positioning';
import { AlloyComponent } from 'hugemce/alloy/api/component/ComponentApi';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import { Container } from 'hugemce/alloy/api/ui/Container';

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
