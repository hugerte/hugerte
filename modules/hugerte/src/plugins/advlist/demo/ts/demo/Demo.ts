import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'lists advlist code',
  toolbar: 'bullist numlist | outdent indent | code',
  height: 600
});

export {};
