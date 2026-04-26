
export const enum Event {
  Dragstart,
  Dragend,
  Drop
}

const eventId = (('event') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

const getEvent = (transfer: DataTransfer): (Event) | null => {
  const dt: Record<string, any> = transfer;
  return (dt[eventId] ?? null);
};

const mkSetEventFn = (type: Event) => (transfer: DataTransfer): void => {
  const dt: Record<string, any> = transfer;
  dt[eventId] = type;
};

const setEvent = (transfer: DataTransfer, type: Event): void => mkSetEventFn(type)(transfer);

const setDragstartEvent = mkSetEventFn(Event.Dragstart);
const setDropEvent = mkSetEventFn(Event.Drop);
const setDragendEvent = mkSetEventFn(Event.Dragend);

const checkEvent = (expectedType: Event) => (transfer: DataTransfer): boolean => {
  const dt: Record<string, any> = transfer;
  return (dt[eventId] ?? null).exists((type) => type === expectedType);
};

const isInDragStartEvent = checkEvent(Event.Dragstart);
const isInDropEvent = checkEvent(Event.Drop);
const isInDragEndEvent = checkEvent(Event.Dragend);

export {
  getEvent,
  setEvent,
  setDragstartEvent,
  setDropEvent,
  setDragendEvent,
  isInDragStartEvent,
  isInDropEvent,
  isInDragEndEvent
};
