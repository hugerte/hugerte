import { StructureSchema } from "@hugerte/boulder";
import { Result } from "@hugerte/katamari";

import { FormComponentWithLabel, FormComponentWithLabelSpec, formComponentWithLabelFields } from './FormComponent';

export interface DropZoneSpec extends FormComponentWithLabelSpec {
  type: 'dropzone';
}

export interface DropZone extends FormComponentWithLabel {
  type: 'dropzone';
}

const dropZoneFields = formComponentWithLabelFields;

export const dropZoneSchema = StructureSchema.objOf(dropZoneFields);

export const dropZoneDataProcessor = StructureSchema.arrOfVal();

export const createDropZone = (spec: DropZoneSpec): Result<DropZone, StructureSchema.SchemaError<any>> =>
  StructureSchema.asRaw<DropZone>('dropzone', dropZoneSchema, spec);
