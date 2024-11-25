import { Arr, Future, Optional, Result } from "@hugerte/katamari";
import { Class, SugarElement } from "@hugerte/sugar";

import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Menu } from "hugerte/alloy/api/ui/Menu";
import { TouchMenu } from "hugerte/alloy/api/ui/TouchMenu";
import * as Debugging from "hugerte/alloy/debugging/Debugging";
import * as DemoSink from "hugerte/alloy/demo/DemoSink";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";

import * as DemoRenders from './forms/DemoRenders';

/* eslint-disable no-console */

export default (): void => {
  const gui = Gui.create();
  Debugging.registerInspector('gui', gui);

  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  HtmlDisplay.section(
    gui,
    'Run this in touch device mode. It is a button that if you press and hold on it, it opens a circular menu below.',
    {
      dom: {
        tag: 'div'
      },
      components: [
        GuiFactory.premade(sink),

        TouchMenu.sketch({
          dom: {
            tag: 'span',
            innerHtml: 'Menu button (sketch)',
            classes: [ 'tap-menu' ]
          },
          lazySink: () => {
            return Result.value(sink);
          },
          fetch: () => {
            return Future.pure(Optional.from(Arr.map([
              { type: 'item', data: { value: 'alpha', meta: { text: 'Alpha' }}},
              { type: 'item', data: { value: 'beta', meta: { text: 'Beta' }}}
            ], DemoRenders.orb)));
          },
          onExecute: (component, menuComp, item, data) => {
            console.log('selected', data.value);
          },
          menuTransition: {
            property: 'transform',
            transitionClass: 'longpress-menu-transitioning'
          },

          toggleClass: 'selected',
          parts: {
            view: {
              dom: {
                tag: 'div'
              }
            },
            menu: {
              dom: {
                tag: 'div'
              },
              components: [
                Menu.parts.items({ })
              ],
              items: [],
              value: 'touchmenu',
              markers: DemoRenders.orbMarkers()
            }
          }
        })
      ]
    }
  );
};
