

export const setHugerteBaseUrl = (hugerte: any, baseUrl: string): void => {
  const prefix = document.location.protocol + '//' + document.location.host;
  hugerte.baseURL = baseUrl.indexOf('://') === -1 ? prefix + baseUrl : baseUrl;
  hugerte.baseURI = new hugerte.util.URI(hugerte.baseURL);
};

export const detectHugerteBaseUrl = (settings: Record<string, any>): string =>
  typeof settings.base_url === 'string' ? settings.base_url : '/project/node_modules/hugerte';

export const setupHugerteBaseUrl = (hugerte: any, settings: Record<string, any>): void => {
  if (typeof settings.base_url === 'string') {
    setHugerteBaseUrl(hugerte, settings.base_url);
  } else if (!typeof hugerte.baseURL === 'string' || !hugerte.baseURL.includes('/project/')) {
    setHugerteBaseUrl(hugerte, '/project/node_modules/hugerte');
  }
};
