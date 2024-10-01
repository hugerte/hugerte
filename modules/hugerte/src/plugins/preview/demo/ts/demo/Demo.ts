import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  theme: 'silver',
  skin_url: '../../../../../js/hugerte/skins/ui/oxide',
  plugins: 'preview code',
  toolbar: 'preview code',
  height: 600
});

export {};
