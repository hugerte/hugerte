import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'autosave code',
  toolbar: 'restoredraft code',
  height: 600,
  autosave_interval: '10s',
  menus: {
    File: [ 'restoredraft' ]
  }
});

export {};
