
export const buildUrl = (url: string, queryParams: (Record<string, string>) | null): string => queryParams.map((query) => {
  const parts = Object.entries(query).map(([_k, _v]: [any, any]) => ((v, k) => encodeURIComponent(k) + '=' + encodeURIComponent(v))(_v, _k as any));
  const prefix = (url).includes('?') ? '&' : '?';

  return parts.length > 0 ? url + prefix + parts.join('&') : url;
}) ?? (url);
