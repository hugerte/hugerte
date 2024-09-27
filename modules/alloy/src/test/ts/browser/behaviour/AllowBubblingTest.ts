import { Logger, Step, StepSequence } from '@hugemce/agar';
import { UnitTest } from '@hugemce/bedrock-client';

import * as AddEventsBehaviour from 'hugemce/alloy/api/behaviour/AddEventsBehaviour';
import { AllowBubbling } from 'hugemce/alloy/api/behaviour/AllowBubbling';
import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { AlloyComponent } from 'hugemce/alloy/api/component/ComponentApi';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'hugemce/alloy/api/events/AlloyEvents';
import * as GuiSetup from 'hugemce/alloy/api/testhelpers/GuiSetup';
import { Container } from 'hugemce/alloy/api/ui/Container';

UnitTest.asynctest('AllowBubblingTest', (success, failure) => {
  const sDispatchScrollEvent = <T> (comp: AlloyComponent): Step<T, T> => Step.sync(() => {
    const rawEl: Element = comp.element.dom;
    rawEl.dispatchEvent(new Event('scroll'));
  });

  GuiSetup.guiSetup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'div'
      },
      containerBehaviours: Behaviour.derive([
        AllowBubbling.config({
          events: [
            {
              native: 'scroll',
              simulated: 'bubbled.scroll'
            }
          ]
        }),
        AddEventsBehaviour.config('events', [
          AlloyEvents.run('bubbled.scroll', (_comp, _e) => {
            store.add('bubbled.scroll');
          })
        ])
      ])
    })
  ), (_doc, _body, _gui, component, store) =>
    Logger.t('Should fire simulated scroll event', StepSequence.sequenceSame([
      sDispatchScrollEvent(component),
      store.sAssertEq('Should have fired simulated scroll event', [ 'bubbled.scroll' ])
    ])),
  success, failure);
});
