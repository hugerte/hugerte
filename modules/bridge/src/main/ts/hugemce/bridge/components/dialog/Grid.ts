import { FieldProcessor, FieldSchema } from '@hugemce/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';

export interface GridSpec {
  type: 'grid';
  columns: number;
  items: BodyComponentSpec[];
}

export interface Grid {
  type: 'grid';
  columns: number;
  items: BodyComponent[];
}

export const createGridFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  ComponentSchema.type,
  FieldSchema.requiredNumber('columns'),
  itemsField
];
