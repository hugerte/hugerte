import { Attribute } from '@ephox/sugar';

import * as DropdownUtils from '../../dropdown/DropdownUtils';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ButtonBase from '../../ui/common/ButtonBase';
import * as SplitDropdownSchema from '../../ui/schema/SplitDropdownSchema';
import { SplitDropdownApis, SplitDropdownDetail, SplitDropdownSketcher, SplitDropdownSpec } from '../../ui/types/SplitDropdownTypes';
import { HighlightOnOpen } from '../../ui/types/TieredMenuTypes';
import { Composing } from '../behaviour/Composing';
import { Coupling } from '../behaviour/Coupling';
import { Focusing } from '../behaviour/Focusing';
import { Highlighting } from '../behaviour/Highlighting';
import { Keying } from '../behaviour/Keying';
import { Toggling } from '../behaviour/Toggling';
import { AlloyComponent } from '../component/ComponentApi';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as AlloyTriggers from '../events/AlloyTriggers';
import * as SystemEvents from '../events/SystemEvents';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<SplitDropdownDetail, SplitDropdownSpec> = (detail, components, spec, externals) => {

  const switchToMenu = (sandbox: AlloyComponent) => {
    Composing.getCurrent(sandbox).each((current) => {
      Highlighting.highlightFirst(current);
      Keying.focusIn(current);
    });
  };

  const action = (component: AlloyComponent) => {
    const onOpenSync = switchToMenu;
    DropdownUtils.togglePopup(detail, (x: any) => x, component, externals, onOpenSync, HighlightOnOpen.HighlightMenuAndItem).get(() => {});
  };

  const openMenu = (comp: AlloyComponent) => {
    action(comp);
    return true;
  };

  const executeOnButton = (comp: AlloyComponent) => {
    const button = AlloyParts.getPartOrDie(comp, detail, 'button');
    AlloyTriggers.emitExecute(button);
    return true;
  };

  const buttonEvents = {
    ...AlloyEvents.derive([
      AlloyEvents.runOnAttached((component, _simulatedEvent) => {
        const ariaDescriptor = AlloyParts.getPart(component, detail, 'aria-descriptor');
        ariaDescriptor.each((descriptor) => {
          const descriptorId = (('aria') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
          Attribute.set(descriptor.element, 'id', descriptorId);
          Attribute.set(component.element, 'aria-describedby', descriptorId);
        });
      })
    ]),
    ...ButtonBase.events(action)
  };

  const apis: SplitDropdownApis = {
    repositionMenus: (comp) => {
      if (Toggling.isOn(comp)) {
        DropdownUtils.repositionMenus(comp);
      }
    }
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    apis,
    eventOrder: {
      ...detail.eventOrder,
      // Order, the button state is toggled first, so assumed !selected means close.
      [SystemEvents.execute()]: [ 'disabling', 'toggling', 'alloy.base.behaviour' ]
    },

    events: buttonEvents,

    behaviours: SketchBehaviours.augment(
      detail.splitDropdownBehaviours,
      [
        Coupling.config({
          others: {
            sandbox: (hotspot) => {
              const arrow = AlloyParts.getPartOrDie(hotspot, detail, 'arrow');
              const extras = {
                onOpen: () => {
                  Toggling.on(arrow);
                  Toggling.on(hotspot);
                },
                onClose: () => {
                  Toggling.off(arrow);
                  Toggling.off(hotspot);
                }
              };

              return DropdownUtils.makeSandbox(detail, hotspot, extras);
            }
          }
        }),
        Keying.config({
          mode: 'special',
          onSpace: executeOnButton,
          onEnter: executeOnButton,
          onDown: openMenu
        }),
        Focusing.config({ }),
        Toggling.config({
          toggleOnExecute: false,
          aria: {
            mode: 'expanded'
          }
        })
      ]
    ),

    domModification: {
      attributes: {
        'role': detail.role ?? ('button'),
        'aria-haspopup': true
      }
    }
  };
};

const SplitDropdown: SplitDropdownSketcher = Sketcher.composite<SplitDropdownSpec, SplitDropdownDetail, SplitDropdownApis>({
  name: 'SplitDropdown',
  configFields: SplitDropdownSchema.schema(),
  partFields: SplitDropdownSchema.parts(),
  factory,
  apis: {
    repositionMenus: (apis, comp) => apis.repositionMenus(comp)
  }
});

export {
  SplitDropdown
};
