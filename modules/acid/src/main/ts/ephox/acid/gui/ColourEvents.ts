import { CustomEvent, SliderTypes } from '@ephox/alloy';


import { Hex } from '../api/colour/ColourTypes';

const fieldsUpdate = '_' + Math.random().toString(36).slice(2);
const sliderUpdate = '_' + Math.random().toString(36).slice(2);
const paletteUpdate = '_' + Math.random().toString(36).slice(2);

export interface SliderUpdateEvent extends CustomEvent {
  readonly value: SliderTypes.SliderValueY;
}

export interface PaletteUpdateEvent extends CustomEvent {
  readonly value: SliderTypes.SliderValueXY;
}

export interface FieldsUpdateEvent extends CustomEvent {
  readonly hex: Hex;
}

export {
  fieldsUpdate,
  sliderUpdate,
  paletteUpdate
};
