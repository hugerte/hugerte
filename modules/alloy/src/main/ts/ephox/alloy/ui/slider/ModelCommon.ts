import { SugarPosition } from '@ephox/sugar';

import { NativeSimulatedEvent } from '../../events/SimulatedEvent';

const _sliderChangeEvent = 'slider.change.value';
const sliderChangeEvent = () => _sliderChangeEvent;

const isTouchEvent = (evt: MouseEvent | TouchEvent): evt is TouchEvent => evt.type.indexOf('touch') !== -1;

const getEventSource = (simulatedEvent: NativeSimulatedEvent<MouseEvent | TouchEvent>): (SugarPosition) | null => {
  const evt = simulatedEvent.event.raw;
  if (isTouchEvent(evt)) {
    const touchEvent = evt;
    return touchEvent.touches !== undefined && touchEvent.touches.length === 1 ?
      touchEvent.touches[0].map((t: Touch) => SugarPosition(t.clientX, t.clientY)) : null;
  } else {
    const mouseEvent = evt;
    return mouseEvent.clientX !== undefined ? mouseEvent.map((me) => SugarPosition(me.clientX, me.clientY)) : null;
  }
};

export {
  sliderChangeEvent,
  getEventSource
};
