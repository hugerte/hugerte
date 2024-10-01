import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'lists code',
  toolbar: 'numlist bullist | outdent indent | code',
  height: 600,
  contextmenu: 'lists'
});

export {};
