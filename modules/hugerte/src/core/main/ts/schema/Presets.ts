
import * as SchemaElementSets from './SchemaElementSets';
import * as SchemaTypes from './SchemaTypes';

export type PresetName = 'blocks' | 'phrasing' | 'flow';

const cachedSets = {
  'html4': ((() => { let _called = false; let _r: any; return (..._a: any[]) => { if (!_called) { _called = true; _r = (() => SchemaElementSets.getElementSets('html4'))(..._a); } return _r; }; })()),
  'html5': ((() => { let _called = false; let _r: any; return (..._a: any[]) => { if (!_called) { _called = true; _r = (() => SchemaElementSets.getElementSets('html5'))(..._a); } return _r; }; })()),
  'html5-strict': ((() => { let _called = false; let _r: any; return (..._a: any[]) => { if (!_called) { _called = true; _r = (() => SchemaElementSets.getElementSets('html5-strict'))(..._a); } return _r; }; })())
};

export const getElementsPreset = (type: SchemaTypes.SchemaType, name: PresetName | string): (readonly string[]) | null => {
  const { blockContent, phrasingContent, flowContent } = cachedSets[type]();

  if (name === 'blocks') {
    return blockContent;
  } else if (name === 'phrasing') {
    return phrasingContent;
  } else if (name === 'flow') {
    return flowContent;
  } else {
    return null;
  }
};

