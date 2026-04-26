import { Cell } from '@ephox/katamari';
import { SugarPosition } from '@ephox/sugar';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { CustomEvent, NativeSimulatedEvent } from '../../events/SimulatedEvent';

export type SliderValueX = number;

export type SliderValueY = number;

export interface SliderValueXY {
  readonly x: number;
  readonly y: number;
}

export type SliderValue = SliderValueX | SliderValueY | SliderValueXY;

export interface SliderUpdateEvent extends CustomEvent {
  value: SliderValue;
}

export interface SliderModelDetailParts {
  getSpectrum: (component: AlloyComponent) => AlloyComponent;
  getLeftEdge: (component: AlloyComponent) => (AlloyComponent) | null;
  getRightEdge: (component: AlloyComponent) => (AlloyComponent) | null;
  getTopEdge: (component: AlloyComponent) => (AlloyComponent) | null;
  getBottomEdge: (component: AlloyComponent) => (AlloyComponent) | null;
}

export interface EdgeActions {
  'top-left': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
  'top': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
  'top-right': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
  'right': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
  'bottom-right': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
  'bottom': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
  'bottom-left': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
  'left': ((edge: AlloyComponent, detail: SliderDetail) =) | null void>;
}

export interface Manager {
  setValueFrom: (spectrum: AlloyComponent, detail: SliderDetail, value: number | SugarPosition) => void;
  setToMin: (spectrum: AlloyComponent, detail: SliderDetail) => void;
  setToMax: (spectrum: AlloyComponent, detail: SliderDetail) => void;
  getValueFromEvent: (simulatedEvent: NativeSimulatedEvent<MouseEvent | TouchEvent>) => (number | SugarPosition) | null;
  setPositionFromValue: (slider: AlloyComponent, thumb: AlloyComponent, detail: SliderDetail, parts: SliderModelDetailParts) => void;
  onLeft: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => (boolean) | null;
  onRight: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => (boolean) | null;
  onUp: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => (boolean) | null;
  onDown: (spectrum: AlloyComponent, detail: SliderDetail, useMultiplier?: boolean) => (boolean) | null;
  edgeActions: EdgeActions;
}

export interface SliderModelDetail {
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  value: Cell<SliderValue>;
  getInitialValue: () => SliderValue;
  manager: Manager;
}

export interface VerticalSliderModelDetail extends SliderModelDetail {
  minY: number;
  maxY: number;
}

export interface HorizontalSliderModelDetail extends SliderModelDetail {
  minX: number;
  maxX: number;
}

export interface TwoDSliderModelDetail extends SliderModelDetail {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface SliderDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[];
  sliderBehaviours: SketchBehaviours;

  model: SliderModelDetail;
  rounded: boolean;
  stepSize: number;
  speedMultiplier: number;
  snapToGrid: boolean;
  snapStart: (number) | null;

  onChange: (component: AlloyComponent, thumb: AlloyComponent, value: number | SliderValue) => void;
  onChoose: (component: AlloyComponent, thumb: AlloyComponent, value: number | SliderValue) => void;
  onDragStart: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd: (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit: (component: AlloyComponent, thumb: AlloyComponent, spectrum: AlloyComponent, value: number | SliderValue) => void;

  mouseIsDown: Cell<boolean>;
}

export interface VerticalSliderDetail extends SliderDetail {
  model: VerticalSliderModelDetail;
}

export interface HorizontalSliderDetail extends SliderDetail {
  model: HorizontalSliderModelDetail;
}

export interface TwoDSliderDetail extends SliderDetail {
  model: TwoDSliderModelDetail;
}

export interface HorizontalSliderSpecMode {
  mode: 'x';
  minX?: number;
  maxX?: number;
  getInitialValue: () => SliderValueX;
}

export interface VerticalSliderSpecMode {
  mode: 'y';
  minY?: number;
  maxY?: number;
  getInitialValue: () => SliderValueY;
}

export interface TwoDSliderSpecMode {
  mode: 'xy';
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  getInitialValue: () => SliderValueXY;
}

export interface SliderSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  sliderBehaviours?: AlloyBehaviourRecord;

  model: HorizontalSliderSpecMode | VerticalSliderSpecMode | TwoDSliderSpecMode;
  stepSize?: number;
  snapToGrid?: boolean;
  snapStart?: number;
  rounded?: boolean;

  onChange?: (component: AlloyComponent, thumb: AlloyComponent, value: SliderValue) => void;
  onChoose?: (component: AlloyComponent, thumb: AlloyComponent, value: SliderValue) => void;
  onDragStart?: (component: AlloyComponent, thumb: AlloyComponent) => void;
  onDragEnd?: (component: AlloyComponent, thumb: AlloyComponent) => void;

  onInit?: (component: AlloyComponent, thumb: AlloyComponent, spectrum: AlloyComponent, value: SliderValue) => void;
}

export interface SliderApis {
  setValue: (slider: AlloyComponent, value: SliderValue) => void;
  resetToMin: (slider: AlloyComponent) => void;
  resetToMax: (slider: AlloyComponent) => void;
  refresh: (slider: AlloyComponent) => void;
}

export interface SliderSketcher extends CompositeSketch<SliderSpec>, SliderApis { }
