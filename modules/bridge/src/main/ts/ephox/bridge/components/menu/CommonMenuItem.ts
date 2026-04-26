import { FieldProcessor } from '@ephox/boulder';

import * as ComponentSchema from '../../core/ComponentSchema';

export interface CommonMenuItemSpec {
  enabled?: boolean;
  text?: string;
  value?: string;
  meta?: Record<string, any>;
  shortcut?: string;
}

export interface CommonMenuItemInstanceApi {
  isEnabled: () => boolean;
  setEnabled: (state: boolean) => void;
}

export interface CommonMenuItem {
  enabled: boolean;
  text: (string) | null;
  value: string;
  meta: Record<string, any>;
  shortcut: (string) | null;
}

export const commonMenuItemFields: FieldProcessor[] = [
  ComponentSchema.enabled,
  ComponentSchema.optionalText,
  ComponentSchema.optionalShortcut,
  ComponentSchema.generatedValue('menuitem'),
  ComponentSchema.defaultedMeta
];
