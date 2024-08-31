import { Optional } from '@hugemce/katamari';
import { SugarElement } from '@hugemce/sugar';

import BasicPage from 'hugemce/boss/api/BasicPage';

const hugemceUi = SugarElement.fromDom(Optional.from(document.getElementById('hugemce-ui')).getOrDie('Expected item on page with id "hugemce-ui"'));
const boss = BasicPage();
boss.connect(hugemceUi);
