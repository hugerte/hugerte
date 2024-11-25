import { Id, Thunk } from "@hugerte/katamari";
import { DomEvent, Html, SugarElement, TextContent } from "@hugerte/sugar";

import { AlloyComponent } from "hugerte/alloy/api/component/ComponentApi";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import { AlloySpec } from "hugerte/alloy/api/component/SpecTypes";
import * as Channels from "hugerte/alloy/api/messages/Channels";
import { GuiSystem } from "hugerte/alloy/api/system/Gui";
import { Container } from "hugerte/alloy/api/ui/Container";
import * as Debugging from "hugerte/alloy/debugging/Debugging";

const register = Thunk.cached((gui: GuiSystem) => {
  Debugging.registerInspector('htmldisplay', gui);
});

const section = (gui: GuiSystem, instructions: string, spec: AlloySpec): AlloyComponent => {
  register(gui);
  const information = Container.sketch({
    dom: {
      tag: 'p',
      innerHtml: instructions
    }
  });

  const component = GuiFactory.build(spec);

  const display = GuiFactory.build(
    Container.sketch({
      dom: {
        styles: {
          'padding-left': '100px',
          'padding-top': '20px',
          'padding-right': '100px',
          'border': '1px dashed green'
        }
      },
      components: [
        GuiFactory.premade(component)

      ]
    })
  );

  const dumpUid = Id.generate('html-dump');

  const htmlDump = Html.getOuter(component.element);
  const dump = Container.sketch({
    uid: dumpUid,
    dom: {
      tag: 'p',
      classes: [ 'html-display' ]
    },
    components: [
      GuiFactory.text(htmlDump)
    ]
  });

  const updateHtml = () => {
    gui.getByUid(dumpUid).each((dumpC) => {
      // NOTE: Use SugarBody.body() here for more information.
      TextContent.set(dumpC.element, Html.getOuter(component.element));
    });
  };

  const observer = new MutationObserver((_mutations) => {
    updateHtml();
  });

  observer.observe(component.element.dom, { attributes: true, childList: true, characterData: true, subtree: true });

  const all = GuiFactory.build(
    Container.sketch({
      components: [
        Container.sketch({ dom: { tag: 'hr' }}),
        information,
        GuiFactory.premade(display),
        dump,
        Container.sketch({ dom: { tag: 'hr' }})
      ]
    })
  );

  gui.add(all);

  DomEvent.bind(SugarElement.fromDom(document), 'mousedown', (evt) => {
    if (evt.raw.button === 0) {
      gui.broadcastOn([ Channels.dismissPopups() ], {
        target: evt.target
      });
    }
  });

  return component;

};

export {
  section
};
