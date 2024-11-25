import { Optional } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import BasicPage from "hugerte/boss/api/BasicPage";

const ephoxUi = SugarElement.fromDom(Optional.from(document.getElementById('ephox-ui')).getOrDie('Expected item on page with id "ephox-ui"'));
const boss = BasicPage();
boss.connect(ephoxUi);
