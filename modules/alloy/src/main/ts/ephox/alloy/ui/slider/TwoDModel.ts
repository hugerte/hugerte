import { Css, Height, SugarPosition, Width } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { SliderModelDetailParts, SliderValueXY, TwoDSliderDetail } from '../types/SliderTypes';
import * as EdgeActions from './EdgeActions';
import * as HorizontalModel from './HorizontalModel';
import * as ModelCommon from './ModelCommon';
import * as SliderModel from './SliderModel';
import { currentValue, maxX, maxY, minX, minY, step } from './SliderValues';
import * as VerticalModel from './VerticalModel';

// fire slider change event with xy value
const fireSliderChange = (spectrum: AlloyComponent, value: SliderValueXY): void => {
  AlloyTriggers.emitWith(spectrum, ModelCommon.sliderChangeEvent(), { value });
};

const sliderValue = (x: number, y: number): SliderValueXY => ({
  x,
  y
});

// find both values of x and y offsets of where the mouse was clicked from the model.
// then fire a slider change event with those values, returning the values
const setValueFrom = (spectrum: AlloyComponent, detail: TwoDSliderDetail, value: SugarPosition): SliderValueXY => {
  const xValue = HorizontalModel.findValueOfOffset(spectrum, detail, value.left);
  const yValue = VerticalModel.findValueOfOffset(spectrum, detail, value.top);
  const val = sliderValue(xValue, yValue);
  fireSliderChange(spectrum, val);
  return val;
};

// move in a direction by step size. Fire change at the end
const moveBy = (direction: number, isVerticalMovement: boolean, spectrum: AlloyComponent, detail: TwoDSliderDetail, useMultiplier?: boolean): (number) | null => {
  const f = (direction > 0) ? SliderModel.increaseBy : SliderModel.reduceBy;
  const xValue = isVerticalMovement ? currentValue(detail).x :
    f(currentValue(detail).x, minX(detail), maxX(detail), step(detail, useMultiplier));
  const yValue = !isVerticalMovement ? currentValue(detail).y :
    f(currentValue(detail).y, minY(detail), maxY(detail), step(detail, useMultiplier));

  fireSliderChange(spectrum, sliderValue(xValue, yValue));
  return xValue;
};

const handleMovement = (direction: number, isVerticalMovement: boolean) => (spectrum: AlloyComponent, detail: TwoDSliderDetail, useMultiplier?: boolean): (boolean) | null =>
  moveBy(direction, isVerticalMovement, spectrum, detail, useMultiplier).map<boolean>((() => true as const));

// fire a slider change event with the minimum value
const setToMin = (spectrum: AlloyComponent, detail: TwoDSliderDetail): void => {
  const mX = minX(detail);
  const mY = minY(detail);
  fireSliderChange(spectrum, sliderValue(mX, mY));
};

// fire a slider change event with the maximum value
const setToMax = (spectrum: AlloyComponent, detail: TwoDSliderDetail): void => {
  const mX = maxX(detail);
  const mY = maxY(detail);
  fireSliderChange(spectrum, sliderValue(mX, mY));
};

// get event data as a SugarPosition
const getValueFromEvent = (simulatedEvent: NativeSimulatedEvent<MouseEvent | TouchEvent>): (SugarPosition) | null =>
  ModelCommon.getEventSource(simulatedEvent);

// update the position of the thumb from the slider's current value
const setPositionFromValue = (slider: AlloyComponent, thumb: AlloyComponent, detail: TwoDSliderDetail, edges: SliderModelDetailParts): void => {
  const value = currentValue(detail);
  const xPos = HorizontalModel.findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value.x,
    edges.getLeftEdge(slider),
    edges.getRightEdge(slider),
    detail
  );
  const yPos = VerticalModel.findPositionOfValue(
    slider,
    edges.getSpectrum(slider),
    value.y,
    edges.getTopEdge(slider),
    edges.getBottomEdge(slider),
    detail
  );
  const thumbXRadius = Width.get(thumb.element) / 2;
  const thumbYRadius = Height.get(thumb.element) / 2;
  Css.set(thumb.element, 'left', (xPos - thumbXRadius) + 'px');
  Css.set(thumb.element, 'top', (yPos - thumbYRadius) + 'px');
};

// Key Events
const onLeft = handleMovement(-1, false);
const onRight = handleMovement(1, false);
const onUp = handleMovement(-1, true);
const onDown = handleMovement(1, true);

// Edge Click Actions
const edgeActions = {
  'top-left': EdgeActions.setToTLEdgeXY,
  'top': EdgeActions.setToTEdgeXY,
  'top-right': EdgeActions.setToTREdgeXY,
  'right': EdgeActions.setToREdgeXY,
  'bottom-right': EdgeActions.setToBREdgeXY,
  'bottom': EdgeActions.setToBEdgeXY,
  'bottom-left': EdgeActions.setToBLEdgeXY,
  'left': EdgeActions.setToLEdgeXY
};

export {
  setValueFrom,
  setToMin,
  setToMax,
  getValueFromEvent,
  setPositionFromValue,

  onLeft,
  onRight,
  onUp,
  onDown,
  edgeActions
};
