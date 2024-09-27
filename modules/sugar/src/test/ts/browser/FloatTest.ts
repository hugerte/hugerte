import { Assert, UnitTest } from '@hugemce/bedrock-client';

import * as Insert from 'hugemce/sugar/api/dom/Insert';
import * as Remove from 'hugemce/sugar/api/dom/Remove';
import * as SugarBody from 'hugemce/sugar/api/node/SugarBody';
import { SugarElement } from 'hugemce/sugar/api/node/SugarElement';
import * as Css from 'hugemce/sugar/api/properties/Css';
import * as Float from 'hugemce/sugar/api/properties/Float';
import MathElement from 'hugemce/sugar/test/MathElement';

UnitTest.test('FloatTest', () => {
  const image = SugarElement.fromTag('table');
  const m = MathElement();
  Assert.eq('', null, Float.getRaw(image));
  Float.getRaw(m);

  Insert.append(SugarBody.body(), image);
  Insert.append(SugarBody.body(), m);
  Css.setAll(image, {
    'margin-left': 'auto',
    'margin-right': 'auto'
  });

  Assert.eq('', 'center', Float.divine(image).getOrDie());

  Float.divine(m);
  Float.getRaw(m);
  Css.remove(m, 'margin-right');
  Assert.eq('', false, Float.isCentered(m));
  Css.set(m, 'float', 'none');

  Assert.eq('', true, Float.isCentered(image));

  Css.remove(image, 'margin-left');
  Css.remove(image, 'margin-right');

  Assert.eq('', 'none', Float.divine(image).getOrDie());

  Css.set(image, 'float', 'none');
  Assert.eq('', 'none', Float.divine(image).getOrDie());
  Assert.eq('', 'none', Float.getRaw(image));

  Css.set(image, 'float', 'right');
  Assert.eq('', 'right', Float.divine(image).getOrDie());

  Assert.eq('', false, Float.isCentered(image));
  Float.setCentered(image);
  Assert.eq('', true, Float.isCentered(image));

  Remove.remove(image);
});
