import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'wordcount code',
  toolbar: 'wordcount',
  height: 600
});

export {};
