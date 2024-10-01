import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

export default (): void => {
  hugerte.init({
    selector: '#editor',
    inline: true,
    fixed_toolbar_container: '#toolbar',
    plugins: 'template' // lets you check notification positioning
  });
};
