
import { SugarElement } from '@ephox/sugar';

import BasicPage from 'ephox/boss/api/BasicPage';

const ephoxUi = SugarElement.fromDom(document.getElementById('ephox-ui') ?? null.getOrDie('Expected item on page with id "ephox-ui"'));
const boss = BasicPage();
boss.connect(ephoxUi);
