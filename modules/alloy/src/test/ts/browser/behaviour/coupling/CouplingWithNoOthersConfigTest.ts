import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Coupling } from "hugerte/alloy/api/behaviour/Coupling";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as GuiSetup from "hugerte/alloy/api/testhelpers/GuiSetup";
import { Container } from "hugerte/alloy/api/ui/Container";
import * as StepUtils from "hugerte/alloy/test/StepUtils";

UnitTest.asynctest('CouplingWithNoOthersConfigTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      uid: 'primary',
      containerBehaviours: Behaviour.derive([
        Coupling.config({
          others: { }
        })
      ])
    })
  ), (_doc, _body, _gui, component, _store) => [
    StepUtils.sAssertFailContains(
      'Testing getCoupled with invalid name: anything',
      'Cannot find any known coupled components',
      () => {
        Coupling.getCoupled(component, 'anything');
      }
    ),

    StepUtils.sAssertFailContains(
      'Testing getExistingCoupled with invalid name: anything',
      'Cannot find any known coupled components',
      () => {
        Coupling.getExistingCoupled(component, 'anything');
      }
    )
  ], success, failure);
});
