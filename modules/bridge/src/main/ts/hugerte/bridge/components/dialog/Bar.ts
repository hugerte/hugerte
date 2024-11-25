import { FieldProcessor } from "@hugerte/boulder";

import * as ComponentSchema from '../../core/ComponentSchema';
import { BodyComponent, BodyComponentSpec } from './BodyComponent';

export interface BarSpec {
  type: 'bar';
  items: BodyComponentSpec[];
}

export interface Bar {
  type: 'bar';
  items: BodyComponent[];
}

export const createBarFields = (itemsField: FieldProcessor): FieldProcessor[] => [
  ComponentSchema.type,
  itemsField
];
