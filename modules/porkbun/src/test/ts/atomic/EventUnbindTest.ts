import { UnitTest } from '@ephox/bedrock-client';


import { Event } from 'ephox/porkbun/Event';

UnitTest.test('EventUnbindTest', () => {
  const event = Event([]);

  const first = () => event.unbind(first);
  const second = () => {};

  event.bind(first);
  event.bind(second);

  // ensure unbind during trigger does not cause problems
  event.trigger();
});
