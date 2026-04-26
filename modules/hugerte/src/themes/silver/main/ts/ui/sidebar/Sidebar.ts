import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, Composing, CustomEvent, Focusing, Replacing, SketchSpec,
  Sliding,
  SlotContainer,
  SlotContainerTypes, SystemEvents, Tabstopping
} from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Sidebar as BridgeSidebar } from '@ephox/bridge';
import { Cell } from '@ephox/katamari';
import { Attribute, Css, SugarElement, Width } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';
import { onControlAttached, onControlDetached } from 'hugerte/themes/silver/ui/controls/Controls';

import { ComposingConfigs } from '../alien/ComposingConfigs';
import { SimpleBehaviours } from '../alien/SimpleBehaviours';

export type SidebarConfig = Record<string, BridgeSidebar.SidebarSpec>;

const enum SidebarStateRoleAttr {
  Grown = 'region',
  Shrunk = 'presentation'
}

const setup = (editor: Editor): void => {
  const { sidebars } = editor.ui.registry.getAll();

  // Setup each registered sidebar
  (Object.keys(sidebars)).forEach((name) => {
    const spec = sidebars[name];
    const isActive = () => ((editor.queryCommandValue('ToggleSidebar') ?? null) !== null && ((editor.queryCommandValue('ToggleSidebar') ?? null)) === (name));
    editor.ui.registry.addToggleButton(name, {
      icon: spec.icon,
      tooltip: spec.tooltip,
      onAction: (buttonApi) => {
        editor.execCommand('ToggleSidebar', false, name);
        buttonApi.setActive(isActive());
      },
      onSetup: (buttonApi) => {
        buttonApi.setActive(isActive());
        const handleToggle = () => buttonApi.setActive(isActive());
        editor.on('ToggleSidebar', handleToggle);
        return () => {
          editor.off('ToggleSidebar', handleToggle);
        };
      }
    });
  });
};

const getApi = (comp: AlloyComponent): BridgeSidebar.SidebarInstanceApi => ({
  element: (): HTMLElement => comp.element.dom
});

const makePanels = (parts: SlotContainerTypes.SlotContainerParts, panelConfigs: SidebarConfig) => {
  const specs = (Object.keys(panelConfigs)).map((name) => {
    const spec = panelConfigs[name];
    const bridged = StructureSchema.getOrDie(BridgeSidebar.createSidebar(spec));
    return {
      name,
      getApi,
      onSetup: bridged.onSetup,
      onShow: bridged.onShow,
      onHide: bridged.onHide
    };
  });

  return (specs).map((spec) => {
    const editorOffCell = Cell(() => {});
    return parts.slot(
      spec.name,
      {
        dom: {
          tag: 'div',
          classes: [ 'tox-sidebar__pane' ]
        },
        behaviours: SimpleBehaviours.unnamedEvents([
          onControlAttached(spec, editorOffCell),
          onControlDetached(spec, editorOffCell),
          AlloyEvents.run<SystemEvents.AlloySlotVisibilityEvent>(SystemEvents.slotVisibility(), (sidepanel, se) => {
            const data = se.event;
            const optSidePanelSpec = ((specs).find((config) => config.name === data.name) ?? null);
            optSidePanelSpec.each((sidePanelSpec) => {
              const handler = data.visible ? sidePanelSpec.onShow : sidePanelSpec.onHide;
              handler(sidePanelSpec.getApi(sidepanel));
            });
          })
        ])
      }
    );
  });
};

const makeSidebar = (panelConfigs: SidebarConfig) => SlotContainer.sketch((parts) => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-sidebar__pane-container' ]
  },
  components: makePanels(parts, panelConfigs),
  slotBehaviours: SimpleBehaviours.unnamedEvents([
    AlloyEvents.runOnAttached((slotContainer) => SlotContainer.hideAllSlots(slotContainer))
  ])
}));

const setSidebar = (sidebar: AlloyComponent, panelConfigs: SidebarConfig, showSidebar: string | undefined): void => {
  const optSlider = Composing.getCurrent(sidebar);

  optSlider.each((slider) => {
    Replacing.set(slider, [ makeSidebar(panelConfigs) ]);

    // Show the default sidebar
    const configKey = showSidebar?.toLowerCase();
    if (typeof (configKey) === 'string' && Object.prototype.hasOwnProperty.call(panelConfigs, configKey)) {
      Composing.getCurrent(slider).each((slotContainer) => {
        SlotContainer.showSlot(slotContainer, configKey);
        Sliding.immediateGrow(slider);
        // TINY-8710: Remove the width as since the skins/styles won't have loaded yet, so it's going to be incorrect
        Css.remove(slider.element, 'width');
        updateSidebarRoleOnToggle(sidebar.element, SidebarStateRoleAttr.Grown);
      });
    }
  });
};

const updateSidebarRoleOnToggle = (sidebar: SugarElement<HTMLElement>, sidebarState: SidebarStateRoleAttr): void => {
  Attribute.set(sidebar, 'role', sidebarState);
};

const toggleSidebar = (sidebar: AlloyComponent, name: string): void => {
  const optSlider = Composing.getCurrent(sidebar);
  optSlider.each((slider) => {
    const optSlotContainer = Composing.getCurrent(slider);
    optSlotContainer.each((slotContainer) => {
      if (Sliding.hasGrown(slider)) {
        if (SlotContainer.isShowing(slotContainer, name)) {
          // close the slider and then hide the slot after the animation finishes
          Sliding.shrink(slider);
          updateSidebarRoleOnToggle(sidebar.element, SidebarStateRoleAttr.Shrunk);
        } else {
          SlotContainer.hideAllSlots(slotContainer);
          SlotContainer.showSlot(slotContainer, name);
          updateSidebarRoleOnToggle(sidebar.element, SidebarStateRoleAttr.Grown);
        }
      } else {
        // Should already be hidden if the animation has finished but if it has not we hide them
        SlotContainer.hideAllSlots(slotContainer);
        SlotContainer.showSlot(slotContainer, name);
        Sliding.grow(slider);
        updateSidebarRoleOnToggle(sidebar.element, SidebarStateRoleAttr.Grown);
      }
    });
  });
};

const whichSidebar = (sidebar: AlloyComponent): (string) | null => {
  const optSlider = Composing.getCurrent(sidebar);
  return optSlider.bind((slider) => {
    const sidebarOpen = Sliding.isGrowing(slider) || Sliding.hasGrown(slider);
    if (sidebarOpen) {
      const optSlotContainer = Composing.getCurrent(slider);
      return optSlotContainer.bind((slotContainer) =>
        ((SlotContainer.getSlotNames(slotContainer)).find((name) =>
          SlotContainer.isShowing(slotContainer, name)) ?? null)
      );
    } else {
      return null;
    }
  });
};

interface FixSizeEvent extends CustomEvent {
  readonly width: string;
}
const fixSize = (('FixSizeEvent') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const autoSize = (('AutoSizeEvent') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

const renderSidebar = (spec: SketchSpec): AlloySpec => ({
  uid: spec.uid,
  dom: {
    tag: 'div',
    classes: [ 'tox-sidebar' ],
    attributes: {
      role: SidebarStateRoleAttr.Shrunk
    }
  },
  components: [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-sidebar__slider' ]
      },
      components: [
        // this will be replaced on setSidebar
      ],
      behaviours: Behaviour.derive([
        Tabstopping.config({ }),
        Focusing.config({ }), // TODO use Keying and use focusIn, but need to handle if sidebar contains nothing
        Sliding.config({
          dimension: {
            property: 'width'
          },
          closedClass: 'tox-sidebar--sliding-closed',
          openClass: 'tox-sidebar--sliding-open',
          shrinkingClass: 'tox-sidebar--sliding-shrinking',
          growingClass: 'tox-sidebar--sliding-growing',
          onShrunk: (slider: AlloyComponent) => {
            const optSlotContainer = Composing.getCurrent(slider);
            optSlotContainer.each(SlotContainer.hideAllSlots);
            AlloyTriggers.emit(slider, autoSize);
          },
          onGrown: (slider: AlloyComponent) => {
            AlloyTriggers.emit(slider, autoSize);
          },
          onStartGrow: (slider: AlloyComponent) => {
            AlloyTriggers.emitWith(slider, fixSize, { width: Css.getRaw(slider.element, 'width') ?? ('') });
          },
          onStartShrink: (slider: AlloyComponent) => {
            AlloyTriggers.emitWith(slider, fixSize, { width: Width.get(slider.element) + 'px' });
          }
        }),
        Replacing.config({}),
        Composing.config({
          find: (comp: AlloyComponent) => {
            const children = Replacing.contents(comp);
            return ((children)[0] ?? null);
          }
        })
      ])
    }
  ],
  behaviours: Behaviour.derive([
    ComposingConfigs.childAt(0),
    AddEventsBehaviour.config('sidebar-sliding-events', [
      AlloyEvents.run<FixSizeEvent>(fixSize, (comp, se) => {
        Css.set(comp.element, 'width', se.event.width);
      }),
      AlloyEvents.run(autoSize, (comp, _se) => {
        Css.remove(comp.element, 'width');
      })
    ])
  ])
});

export {
  setSidebar,
  toggleSidebar,
  whichSidebar,
  renderSidebar,
  setup
};
