import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'visualchars code',
  toolbar: 'visualchars code',
  visualchars_default_state: true,
  skin_url: '../../../../../js/hugerte/skins/ui/oxide',
  height: 600
});

export {};
