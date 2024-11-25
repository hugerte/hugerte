import { TooltippingTypes } from "@hugerte/alloy";
import { Fun } from "@hugerte/katamari";

import I18n from 'hugerte/core/api/util/I18n';
import { UiFactoryBackstageProviders } from 'hugerte/themes/silver/backstage/Backstage';

const defaultOptions: Record<string, any> = {
  images_file_types: 'jpeg,jpg,jpe,jfi,jif,jfif,png,gif,bmp,webp'
};

export default {
  icons: (): Record<string, string> => ({}),
  menuItems: (): Record<string, any> => ({}),
  translate: I18n.translate,
  isDisabled: Fun.never,
  getOption: <T>(name: string): T | undefined => defaultOptions[name],
  tooltips: {
    getConfig: (): TooltippingTypes.TooltippingConfigSpec => {
      return { } as any;
    },
    getComponents: () => {
      return [] as any;
    },
  }
} as UiFactoryBackstageProviders;
