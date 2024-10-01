import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'fullscreen code',
  toolbar: 'fullscreen code',
  height: 600,
  fullscreen_native: true
});

hugerte.init({
  selector: 'textarea.hugerte2',
  plugins: 'fullscreen code',
  toolbar: 'fullscreen code',
  height: 600
});

export {};
