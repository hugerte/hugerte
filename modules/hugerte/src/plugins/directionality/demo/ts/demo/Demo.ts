import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'directionality code lists',
  toolbar: 'ltr rtl code | bullist numlist',
  height: 600
});

export {};
