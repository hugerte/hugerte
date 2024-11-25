import { StructureSchema, ValueType } from "@hugerte/boulder";
import { Result } from "@hugerte/katamari";

import { FormComponentWithLabel, formComponentWithLabelFields, FormComponentWithLabelSpec } from './FormComponent';

export interface ColorPickerSpec extends FormComponentWithLabelSpec {
  type: 'colorpicker';
}

export interface ColorPicker extends FormComponentWithLabel {
  type: 'colorpicker';
}

const colorPickerFields = formComponentWithLabelFields;

export const colorPickerSchema = StructureSchema.objOf(colorPickerFields);

export const colorPickerDataProcessor = ValueType.string;

export const createColorPicker = (spec: ColorPickerSpec): Result<ColorPicker, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<ColorPicker>('colorpicker', colorPickerSchema, spec);
