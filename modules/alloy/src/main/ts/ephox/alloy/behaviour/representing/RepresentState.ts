import { Cell } from '@ephox/katamari';

import { ItemDataTuple } from '../../ui/types/ItemTypes';
import { nuState } from '../common/BehaviourState';
import {
  DatasetRepresentingState, ManualRepresentingState, MemoryRepresentingState, RepresentingConfig, RepresentingState
} from './RepresentingTypes';

const memory = (): MemoryRepresentingState => {
  const data = Cell<any>(null);

  const readState = () => ({
    mode: 'memory',
    value: data.get()
  });

  const isNotSet = () => data.get() === null;

  const clear = () => {
    data.set(null);
  };

  return nuState({
    set: data.set,
    get: data.get,
    isNotSet,
    clear,
    readState
  });
};

const manual = (): ManualRepresentingState => {
  const readState = () => {};

  return nuState({
    readState
  });
};

const dataset = (): DatasetRepresentingState => {
  const dataByValue = Cell({ });
  const dataByText = Cell({ });

  const readState = () => ({
    mode: 'dataset',
    dataByValue: dataByValue.get(),
    dataByText: dataByText.get()
  });

  const clear = (): void => {
    dataByValue.set({ });
    dataByText.set({ });
  };

  // itemString can be matching value or text.
  // TODO: type problem - impossible to correctly return value when type parameter only exists in return type
  const lookup = <T extends ItemDataTuple>(itemString: string): (T) | null => (dataByValue.get() as any)[itemString].orThunk(() => (dataByText.get() as any)[itemString]);

  const update = <T extends ItemDataTuple>(items: T[]): void => {
    const currentDataByValue = dataByValue.get();
    const currentDataByText = dataByText.get();
    const newDataByValue: Record<string, T> = { };
    const newDataByText: Record<string, T> = { };
    (items).forEach((item) => {
      newDataByValue[item.value] = item;
      (item as any)['meta'].each((meta) => {
        (meta as any)['text'].each((text) => {
          newDataByText[text] = item;
        });
      });
    });

    dataByValue.set({
      ...currentDataByValue,
      ...newDataByValue
    });
    dataByText.set({
      ...currentDataByText,
      ...newDataByText
    });
  };

  return nuState({
    readState,
    lookup,
    update,
    clear
  });
};

const init = (spec: RepresentingConfig): RepresentingState =>
  spec.store.manager.state(spec);

export {
  memory,
  dataset,
  manual,

  init
};
