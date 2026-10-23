import createDompurify from 'dompurify';

// We never use the TrustedHTML that DOMPurify could return, so disable the
// per-instance "dompurify" Trusted Types policy (which violates a trusted-types CSP).
export const sanitizeHtmlString = (html: string): string => createDompurify().sanitize(html, {
  TRUSTED_TYPES_POLICY: null
});
