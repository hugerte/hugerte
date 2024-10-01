import { Strings, Type } from '@ephox/katamari';

export const setHugerteBaseUrl = (hugerte: any, baseUrl: string): void => {
  const prefix = document.location.protocol + '//' + document.location.host;
  hugerte.baseURL = baseUrl.indexOf('://') === -1 ? prefix + baseUrl : baseUrl;
  hugerte.baseURI = new hugerte.util.URI(hugerte.baseURL);
};

export const detectHugerteBaseUrl = (settings: Record<string, any>): string =>
  Type.isString(settings.base_url) ? settings.base_url : '/project/node_modules/hugerte';

export const setupHugerteBaseUrl = (hugerte: any, settings: Record<string, any>): void => {
  if (Type.isString(settings.base_url)) {
    setHugerteBaseUrl(hugerte, settings.base_url);
  } else if (!Type.isString(hugerte.baseURL) || !Strings.contains(hugerte.baseURL, '/project/')) {
    setHugerteBaseUrl(hugerte, '/project/node_modules/hugerte');
  }
};
