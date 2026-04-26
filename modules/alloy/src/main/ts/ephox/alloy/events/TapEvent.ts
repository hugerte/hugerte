import { Objects } from '@ephox/boulder';
import { Cell, Singleton } from '@ephox/katamari';
import { Compare, EventArgs, SugarElement } from '@ephox/sugar';

import { DelayedFunction } from '../alien/DelayedFunction';
import * as NativeEvents from '../api/events/NativeEvents';
import * as SystemEvents from '../api/events/SystemEvents';
import { GuiEventSettings } from './GuiEvents';

type EventHandler = (event: EventArgs<Event>) => (boolean) | null;

export interface TouchHistoryData {
  readonly x: number;
  readonly y: number;
  readonly target: SugarElement<Node>;
}

interface Monitor {
  readonly fireIfReady: (event: EventArgs<Event>, type: string) => (boolean) | null;
}

const SIGNIFICANT_MOVE = 5;

const LONGPRESS_DELAY = 400;

const getTouch = (event: EventArgs<TouchEvent>): (Touch) | null => {
  const raw = event.raw;
  if (raw.touches === undefined || raw.touches.length !== 1) {
    return null;
  }
  return raw.touches[0];
};

// Check to see if the touch has changed a *significant* amount
const isFarEnough = (touch: Touch, data: TouchHistoryData): boolean => {
  const distX = Math.abs(touch.clientX - data.x);
  const distY = Math.abs(touch.clientY - data.y);
  return distX > SIGNIFICANT_MOVE || distY > SIGNIFICANT_MOVE;
};

const monitor = (settings: GuiEventSettings): Monitor => {
  /* A tap event is a combination of touchstart and touchend on the same element
   * without a *significant* touchmove in between.
   */

  const startData = Singleton.value<TouchHistoryData>();
  const longpressFired = Cell<boolean>(false);

  const longpress = DelayedFunction((event: EventArgs) => {
    settings.triggerEvent(SystemEvents.longpress(), event);
    longpressFired.set(true);
  }, LONGPRESS_DELAY);

  const handleTouchstart = (event: EventArgs<TouchEvent>): (boolean) | null => {
    getTouch(event).each((touch) => {
      longpress.cancel();

      const data = {
        x: touch.clientX,
        y: touch.clientY,
        target: event.target
      };

      longpress.schedule(event);
      longpressFired.set(false);
      startData.set(data);
    });
    return null;
  };

  const handleTouchmove = (event: EventArgs<TouchEvent>): (boolean) | null => {
    longpress.cancel();
    getTouch(event).each((touch) => {
      startData.on((data) => {
        if (isFarEnough(touch, data)) {
          startData.clear();
        }
      });
    });
    return null;
  };

  const handleTouchend = (event: EventArgs): (boolean) | null => {
    longpress.cancel();

    const isSame = (data: TouchHistoryData) => Compare.eq(data.target, event.target);

    return startData.get().filter(isSame).map((_data) => {
      if (longpressFired.get()) {
        event.prevent();
        return false;
      } else {
        return settings.triggerEvent(SystemEvents.tap(), event);
      }
    });
  };

  const handlers: Record<string, EventHandler> = Objects.wrapAll([
    { key: NativeEvents.touchstart(), value: handleTouchstart },
    { key: NativeEvents.touchmove(), value: handleTouchmove },
    { key: NativeEvents.touchend(), value: handleTouchend }
  ] as Array<{ key: string; value: EventHandler }>);

  const fireIfReady = (event: EventArgs<Event>, type: string): (boolean) | null =>
    ((handlers)[type] ?? null).bind((handler) => handler(event));

  return {
    fireIfReady
  };
};

export {
  monitor
};
