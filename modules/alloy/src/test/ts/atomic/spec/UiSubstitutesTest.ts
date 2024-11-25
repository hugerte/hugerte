import { Logger } from "@hugerte/agar";
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from "@hugerte/katamari";

import { CompositeSketchDetail } from "hugerte/alloy/api/ui/Sketcher";
import { ConfiguredPart } from "hugerte/alloy/parts/AlloyParts";
import * as UiSubstitutes from "hugerte/alloy/spec/UiSubstitutes";

interface SubstitutedPart extends ConfiguredPart {
  components: any[];
}

UnitTest.test('UiSubstitutesTest', () => {
  Logger.sync(
    'Testing empty components',
    () => {
      const actual = UiSubstitutes.substitutePlaces(Optional.some('detail'), { } as CompositeSketchDetail, [ ], { });
      Assert.eq('Components should stay empty', [ ], actual);
    }
  );

  Logger.sync(
    'Testing everything normal',
    () => {
      const actual = UiSubstitutes.substitutePlaces(Optional.some('owner'), 'detail' as unknown as CompositeSketchDetail, [
        { uiType: 'normal' }
      ] as ConfiguredPart[], { });
      Assert.eq('Normal should be returned as is', [
        { uiType: 'normal', components: [ ] }
      ] as unknown as SubstitutedPart[], actual);
    }
  );

  Logger.sync(
    'Testing one level with a dependent',
    () => {
      const actual = UiSubstitutes.substitutePlaces(Optional.some('owner'), 'detail' as unknown as CompositeSketchDetail, [
        { uiType: 'normal' },
        { uiType: 'placeholder', name: 'foo', owner: 'owner' }
      ] as ConfiguredPart[], {
        foo: UiSubstitutes.single(true, (detail) => ({
          uiType: 'foo-dependent',
          detail
        } as unknown as ConfiguredPart))
      });
      Assert.eq('Dependent should be substituted', [
        { uiType: 'normal', components: [ ] },
        { uiType: 'foo-dependent', detail: 'detail', components: [ ] }
      ] as unknown as SubstitutedPart[], actual);
    }
  );

  // Do a property based test once it has worked that everything returns a uiType
  // Jsc.property(
  //   'E')
  // assert.eq(1, 2);
});
