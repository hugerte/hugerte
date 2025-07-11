import { Version } from '../detect/Version';
import { PlatformInfo } from '../info/PlatformInfo';

interface UaInfo {
  readonly current: string | undefined;
  readonly version: Version;
}

interface OperatingSystem extends UaInfo {
  readonly isWindows: boolean;
  readonly isiOS: boolean;
  readonly isAndroid: boolean;
  readonly isMacOS: boolean;
  readonly isLinux: boolean;
  readonly isSolaris: boolean;
  readonly isFreeBSD: boolean;
  readonly isChromeOS: boolean;
}

interface Browser extends UaInfo {
  readonly isEdge: boolean;
  readonly isChromium: boolean;
  readonly isIE: boolean;
  readonly isOpera: boolean;
  readonly isFirefox: boolean;
  readonly isSafari: boolean;
}

interface DeviceType {
  readonly isiPad: boolean;
  readonly isiPhone: boolean;
  readonly isTablet: boolean;
  readonly isPhone: boolean;
  readonly isTouch: boolean;
  readonly isAndroid: boolean;
  readonly isiOS: boolean;
  readonly isWebView: boolean;
  readonly isDesktop: boolean;
}

// There are no native typescript types for navigator.UserAgentData at this stage so have to manually define it

export interface UserAgentDataBrand {
  readonly brand: string;
  readonly version: string;
}

export interface UserAgentData {
  readonly brands: UserAgentDataBrand[];
  readonly mobile: boolean;
}

const detectUaString = (candidates: PlatformInfo[], userAgent: any): UaInfo => {
  const agent = String(userAgent).toLowerCase();
  const platform = candidates.find((candidate) => candidate.search(agent));
  return platform ? {
    current: platform.name,
    version: Version.detect(platform.versionRegexes, userAgent)
  } : {
    current: undefined,
    version: { major: 0, minor: 0 }
  };
};

const detectBrowserUaData = (browsers: PlatformInfo[], userAgentData: UserAgentData): UaInfo | undefined => {
  // TODO possible to rewrite this more functionally? (ES2015-y)
  // For every brand of the user agent data we have, like Chromium and Chrome
  for (const uaBrand of userAgentData.brands) {
    // Lowercase the brand
    const lcBrand = uaBrand.brand.toLowerCase();
    // And check whether any of the browsers we know has the same brand
    const browser = browsers.find((browser) => lcBrand === browser.brand?.toLowerCase());
    // If we found a browser with the same brand, return its name and get the version from the user agent data
    if (browser) {
      return {
        current: browser.name,
        version: { major: parseInt(uaBrand.version, 10), minor: 0 }
      };
    }
  }
  return undefined;
};

const nuOS = (info: UaInfo): OperatingSystem => ({
  ...info,

  isWindows: info.current === 'Windows',
  isiOS: info.current === 'iOS',
  isAndroid: info.current === 'Android',
  isMacOS: info.current === 'macOS',
  isLinux: info.current === 'Linux',
  isSolaris: info.current === 'Solaris',
  isFreeBSD: info.current === 'FreeBSD',
  isChromeOS: info.current === 'ChromeOS',
});

const nuBrowser = (info: UaInfo): Browser => ({
  ...info,

  isEdge: info.current === 'Edge',
  isChromium: info.current === 'Chromium',
  isIE: info.current === 'IE',
  isOpera: info.current === 'Opera',
  isFirefox: info.current === 'Firefox',
  isSafari: info.current === 'Safari',
});

const DeviceType = (os: OperatingSystem, browser: Browser, userAgent: string, mediaMatch: (query: string) => boolean): DeviceType => {
  const isiPad = os.isiOS && /ipad/i.test(userAgent) === true;
  const isiPhone = os.isiOS && !isiPad;
  const isMobile = os.isiOS || os.isAndroid;
  const isTouch = isMobile || mediaMatch('(pointer:coarse)');
  const isTablet = isiPad || !isiPhone && isMobile && mediaMatch('(min-device-width:768px)');
  const isPhone = isiPhone || isMobile && !isTablet;

  // iOS webview
  const isWebView = browser.isSafari && os.isiOS && /safari/i.test(userAgent) === false;

  return {
    isiPad,
    isiPhone,
    isTablet,
    isPhone,
    isTouch,
    isAndroid: os.isAndroid,
    isiOS: os.isiOS,
    isWebView,
    isDesktop: !isPhone && !isTablet && !isWebView,
  };
};

export interface PlatformDetection {
  readonly browser: Browser;
  readonly os: OperatingSystem;
  readonly deviceType: DeviceType;
}

const detect = (userAgent: string, userAgentData: UserAgentData | undefined, mediaMatch: (query: string) => boolean): PlatformDetection => {
  const browsers = PlatformInfo.browsers;
  const oses = PlatformInfo.oses;

  // Not possible to use ? and : here because if detectBrowserUaData returns undefined, we also want to go with the third argument
  const browser = nuBrowser(userAgentData && detectBrowserUaData(browsers, userAgentData) || detectUaString(browsers, userAgent));
  const os = nuOS(detectUaString(oses, userAgent));

  const deviceType = DeviceType(os, browser, userAgent, mediaMatch);

  return {
    browser,
    os,
    deviceType
  };
};

export const PlatformDetection = {
  detect
};
