import { hugerte, HugeRTE } from './Hugerte';

declare const module: any;
declare const window: any;

const exportToModuleLoaders = (hugerte: HugeRTE) => {
  if (typeof module === 'object') {
    try {
      module.exports = hugerte;
    } catch (_) {
      // It will thrown an error when running this module
      // within webpack where the module.exports object is sealed
    }
  }
};

const exportToWindowGlobal = (hugerte: HugeRTE) => {
  window.hugerte = hugerte;
  window.hugeRTE = hugerte;
};

exportToWindowGlobal(hugerte);
exportToModuleLoaders(hugerte);
