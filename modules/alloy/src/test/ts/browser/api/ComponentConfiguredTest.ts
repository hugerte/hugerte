import { Assertions, Logger, Pipeline, Step } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';
import { SugarElement } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Toggling } from "hugerte/alloy/api/behaviour/Toggling";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";

UnitTest.asynctest('Browser Test: api.ComponentConfiguredTest', (success, failure) => {
  Pipeline.async({}, [
    Logger.t(
      'Checking basic component without any behaviour',
      Step.sync(() => {
        const behaviourLess = GuiFactory.build({
          dom: {
            tag: 'div'
          }
        });

        Assertions.assertEq('hasConfigured', false, behaviourLess.hasConfigured(Toggling));
      })
    ),

    Logger.t(
      'Checking basic component with toggling',
      Step.sync(() => {
        const toggler = GuiFactory.build({
          dom: {
            tag: 'div'
          },
          behaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'toggled'
            })
          ])
        });

        Assertions.assertEq('hasConfigured', true, toggler.hasConfigured(Toggling));
      })
    ),

    Logger.t(
      'Checking text component',
      Step.sync(() => {
        const toggler = GuiFactory.build(
          GuiFactory.text('nothing')
        );

        Assertions.assertEq('hasConfigured', false, toggler.hasConfigured(Toggling));
      })
    ),

    Logger.t(
      'Checking external component',
      Step.sync(() => {
        const toggler = GuiFactory.build(
          GuiFactory.external({ element: SugarElement.fromTag('div') })
        );

        Assertions.assertEq('hasConfigured', false, toggler.hasConfigured(Toggling));
      })
    )
  ], success, failure);
});
