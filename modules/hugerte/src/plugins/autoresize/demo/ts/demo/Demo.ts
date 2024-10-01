import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  theme: 'silver',
  plugins: 'autoresize code',
  toolbar: 'autoresize code',
  height: 600
});

export {};
