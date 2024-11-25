import { Arr } from "@hugerte/katamari";
import { Class, SugarElement } from "@hugerte/sugar";

import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as Memento from "hugerte/alloy/api/component/Memento";
import { PremadeSpec } from "hugerte/alloy/api/component/SpecTypes";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Tabbar } from "hugerte/alloy/api/ui/Tabbar";
import { TabSection } from "hugerte/alloy/api/ui/TabSection";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const makeTab = (tabSpec: { view: () => PremadeSpec[]; value: string; text: string }) => ({
    view: tabSpec.view,
    value: tabSpec.value,
    dom: {
      tag: 'button',
      attributes: {
        'data-value': tabSpec.value
      }
    },
    components: [
      GuiFactory.text(tabSpec.text)
    ]
  });

  const pTabbar = TabSection.parts.tabbar({
    dom: {
      tag: 'div'
    },
    components: [
      Tabbar.parts.tabs({ })
    ],
    markers: {
      tabClass: 'demo-tab',
      selectedClass: 'demo-selected-tab'
    }
  });

  const memTabSection = Memento.record(
    TabSection.sketch({
      dom: {
        tag: 'div'
      },
      components: [
        pTabbar,
        TabSection.parts.tabview({
          dom: {
            tag: 'div'
          }
        })
      ],
      tabs: Arr.map([
        {
          value: 'alpha',
          text: 'Alpha',
          view: () => [
            GuiFactory.text('Alpha panel text')
          ]
        },
        {
          value: 'beta',
          text: 'Beta',
          view: () => [
            GuiFactory.text('Beta panel text')
          ]
        }
      ], makeTab)
    })
  );

  const subject = HtmlDisplay.section(
    gui,
    'A basic tab view (refactoring)',
    memTabSection.asSpec()
  );

  setTimeout(() => {
    const chosenTab = window.prompt('Move to tab?');
    if (chosenTab !== null) {
      const tabSection = memTabSection.get(subject);
      TabSection.showTab(tabSection, chosenTab);
    }
  });
};
