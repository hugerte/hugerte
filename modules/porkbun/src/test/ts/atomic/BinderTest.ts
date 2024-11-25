import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Binder from "hugerte/porkbun/Binder";
import { Event } from "hugerte/porkbun/Event";
import * as Events from "hugerte/porkbun/Events";

UnitTest.test('Binder', () => {
  const events = Events.create({
    myEvent: Event([]),
    secondEvent: Event([])
  });

  const binder = Binder.create();

  let called = false;

  binder.bind(events.registry.myEvent, (_event) => {
    called = true;
  });

  Assert.throws('', () => {
    binder.bind(events.registry.myEvent, (_event) => {
      called = true;
    });
  });

  events.trigger.myEvent();
  Assert.eq('', true, called);

  called = false;

  binder.unbind(events.registry.myEvent);

  events.trigger.myEvent();
  Assert.eq('', false, called);

  Assert.throws('', () => {
    binder.unbind(events.registry.myEvent);
  });

  let count = 0;

  binder.bind(events.registry.myEvent, (_event) => {
    count++;
  });

  binder.bind(events.registry.secondEvent, (_event) => {
    count++;
  });

  binder.unbindAll();

  events.trigger.myEvent();
  events.trigger.secondEvent();

  Assert.eq('', 0, count);
});
