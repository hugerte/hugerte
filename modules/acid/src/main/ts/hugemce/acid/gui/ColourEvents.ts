import { CustomEvent, SliderTypes } from '@hugemce/alloy';
import { Id } from '@hugemce/katamari';

import { Hex } from '../api/colour/ColourTypes';

const fieldsUpdate = Id.generate('rgb-hex-update');
const sliderUpdate = Id.generate('slider-update');
const paletteUpdate = Id.generate('palette-update');

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
