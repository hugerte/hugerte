import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  theme: 'silver',
  skin_url: '../../../../../js/hugerte/skins/ui/oxide',
  plugins: 'nonbreaking code',
  toolbar: 'nonbreaking code',
  height: 600
});

export {};
