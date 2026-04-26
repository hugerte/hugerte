

import { PlatformInfo } from '../info/PlatformInfo';
import { UaInfo } from '../info/UaInfo';
import { Version } from './Version';

const detect = (candidates: PlatformInfo[], userAgent: any): PlatformInfo | null => {
  const agent = String(userAgent).toLowerCase();
  return (candidates.find((candidate) => {
    return candidate.search(agent);
  }) ?? null);
};

// They (browser and os) are the same at the moment, but they might
// not stay that way.
const detectBrowser = (browsers: PlatformInfo[], userAgent: any): UaInfo | null => {
  return detect(browsers, userAgent).map((browser): UaInfo => {
    const version = Version.detect(browser.versionRegexes, userAgent);
    return {
      current: browser.name,
      version
    };
  });
};

const detectOs = (oses: PlatformInfo[], userAgent: any): UaInfo | null => {
  return detect(oses, userAgent).map((os): UaInfo => {
    const version = Version.detect(os.versionRegexes, userAgent);
    return {
      current: os.name,
      version
    };
  });
};

export {
  detectBrowser,
  detectOs
};
