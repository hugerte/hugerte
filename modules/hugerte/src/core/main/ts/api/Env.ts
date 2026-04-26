import { PlatformDetection } from '@ephox/sand';

/**
 * This class contains various environment constants like browser versions etc.
 * Normally you don't want to sniff specific browser versions but sometimes you have
 * to when it's impossible to feature detect. So use this with care.
 *
 * @class hugerte.Env
 * @static
 */

const userAgent = navigator.userAgent;
const platform = PlatformDetection.detect();
const browser = platform.browser;
const os = platform.os;
const deviceType = platform.deviceType;

const windowsPhone = userAgent.indexOf('Windows Phone') !== -1;

interface Version {
  major: number;
  minor: number;
}

interface Env {
  transparentSrc: string;
  cacheSuffix: any;
  container: any;
  windowsPhone: boolean;

  browser: {
    current: string | undefined;
    version: Version;
    isEdge: () => boolean;
    isChromium: () => boolean;
    isOpera: () => boolean;
    isFirefox: () => boolean;
    isSafari: () => boolean;
  };
  os: {
    current: string | undefined;
    version: Version;
    isWindows: () => boolean;
    isiOS: () => boolean;
    isAndroid: () => boolean;
    isMacOS: () => boolean;
    isLinux: () => boolean;
    isSolaris: () => boolean;
    isFreeBSD: () => boolean;
    isChromeOS: () => boolean;
  };
  deviceType: {
    isiPad: () => boolean;
    isiPhone: () => boolean;
    isTablet: () => boolean;
    isPhone: () => boolean;
    isTouch: () => boolean;
    isWebView: () => boolean;
    isDesktop: () => boolean;
  };
}

const Env: Env = {
  /**
   * Transparent image data url.
   *
   * @property transparentSrc
   * @type Boolean
   * @final
   */
  transparentSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',

  cacheSuffix: null,
  container: null,

  windowsPhone,

  /**
   * @include ../../../../../tools/docs/hugerte.Env.js
   */
  browser: {
    current: browser.current,
    version: browser.version,
    isChromium: browser.isChromium,
    isEdge: browser.isEdge,
    isFirefox: browser.isFirefox,
    isOpera: browser.isOpera,
    isSafari: browser.isSafari
  },
  os: {
    current: os.current,
    version: os.version,
    isAndroid: os.isAndroid,
    isChromeOS: os.isChromeOS,
    isFreeBSD: os.isFreeBSD,
    isiOS: os.isiOS,
    isLinux: os.isLinux,
    isMacOS: os.isMacOS,
    isSolaris: os.isSolaris,
    isWindows: os.isWindows
  },
  deviceType: {
    isDesktop: deviceType.isDesktop,
    isiPad: deviceType.isiPad,
    isiPhone: deviceType.isiPhone,
    isPhone: deviceType.isPhone,
    isTablet: deviceType.isTablet,
    isTouch: deviceType.isTouch,
    isWebView: deviceType.isWebView
  }
};

export default Env;
