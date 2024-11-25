import { Assertions, GeneralSteps, Logger, Step, UiFinder, Waiter } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';
import { Optional, Result } from "@hugerte/katamari";

import * as AddEventsBehaviour from "hugerte/alloy/api/behaviour/AddEventsBehaviour";
import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as AlloyEvents from "hugerte/alloy/api/events/AlloyEvents";
import * as GuiSetup from "hugerte/alloy/api/testhelpers/GuiSetup";
import { Button } from "hugerte/alloy/api/ui/Button";
import { Container } from "hugerte/alloy/api/ui/Container";
import { InlineView } from "hugerte/alloy/api/ui/InlineView";
import * as Sinks from "hugerte/alloy/test/Sinks";
import * as TestBroadcasts from "hugerte/alloy/test/TestBroadcasts";

UnitTest.asynctest('InlineViewDismissTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => Sinks.relativeSink(), (_doc, _body, gui, component, store) => {
    const inline = GuiFactory.build(
      InlineView.sketch({
        dom: {
          tag: 'div',
          classes: [ 'test-inline' ]
        },

        lazySink: () => {
          return Result.value(component);
        },

        getRelated: () => {
          return Optional.some(related);
        },

        fireDismissalEventInstead: {
          event: 'test-dismiss'
        },

        inlineBehaviours: Behaviour.derive([
          AddEventsBehaviour.config('inline-dismiss-test', [
            AlloyEvents.run('test-dismiss', store.adder('test-dismiss-fired'))
          ])
        ])
      })
    );

    const related = GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'related-to-inline' ],
        styles: {
          background: 'blue',
          width: '50px',
          height: '50px'
        }
      }
    });

    gui.add(related);

    const sCheckOpen = (label: string) => Logger.t(
      label,
      GeneralSteps.sequence([
        Waiter.sTryUntil(
          'Test inline should not be DOM',
          UiFinder.sExists(gui.element, '.test-inline')
        ),
        Step.sync(() => {
          Assertions.assertEq('Checking isOpen API', true, InlineView.isOpen(inline));
        })
      ])
    );

    const sCheckClosed = (label: string) => Logger.t(
      label,
      GeneralSteps.sequence([
        Waiter.sTryUntil(
          'Test inline should not be in DOM',
          UiFinder.sNotExists(gui.element, '.test-inline')
        ),
        Step.sync(() => {
          Assertions.assertEq('Checking isOpen API', false, InlineView.isOpen(inline));
        })
      ])
    );

    return [
      UiFinder.sNotExists(gui.element, '.test-inline'),
      Step.sync(() => {
        InlineView.showAt(inline, Container.sketch({
          dom: {
            innerHtml: 'Inner HTML'
          }
        }), {
          anchor: {
            type: 'selection',
            root: gui.element
          }
        });
      }),
      sCheckOpen('After show'),

      Step.sync(() => {
        InlineView.hide(inline);
      }),

      sCheckClosed('After hide'),

      Logger.t(
        'Show inline view again with different content',
        Step.sync(() => {
          InlineView.showAt(inline, Container.sketch({
            components: [
              Button.sketch({ uid: 'bold-button', dom: { tag: 'button', innerHtml: 'B', classes: [ 'bold-button' ] }, action: store.adder('bold') })
            ]
          }), {
            anchor: {
              type: 'selection',
              root: gui.element
            }
          });
        })
      ),

      sCheckOpen('Should still be open with a button'),
      store.sClear,

      TestBroadcasts.sDismissOn(
        'toolbar: should not close',
        gui,
        '.bold-button'
      ),

      sCheckOpen('Broadcasting dismiss on button should not close inline toolbar'),
      store.sAssertEq('Broadcasting on button should not fire dismiss event', [ ]),

      TestBroadcasts.sDismiss(
        'related element: should not close',
        gui,
        related.element
      ),
      sCheckOpen('The inline view should not have fired dismiss event when broadcasting on related'),
      store.sAssertEq('Broadcasting on related element should not fire dismiss event', [ ]),

      TestBroadcasts.sDismiss(
        'outer gui element: should close',
        gui,
        gui.element
      ),

      sCheckOpen('Dialog should stay open, because we are firing an event instead of dismissing automatically'),
      store.sAssertEq('Broadcasting on outer element SHOULD fire dismiss event', [ 'test-dismiss-fired' ])

    ];
  }, success, failure);
});
