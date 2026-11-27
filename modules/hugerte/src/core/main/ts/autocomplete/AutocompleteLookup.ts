import { Arr, Optional } from '@ephox/katamari';

import * as Spot from '../alien/Spot';
import * as TextDescent from '../alien/TextDescent';
import * as TextSearch from '../alien/TextSearch';
import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Zwsp from '../text/Zwsp';
import { AutocompleteContext, getContext } from './AutocompleteContext';
import { AutocompleterDatabase } from './Autocompleters';
import { AutocompleteLookupData } from './AutocompleteTypes';
import { isWhitespace } from './AutocompleteUtils';

export interface AutocompleteLookupInfo {
  context: AutocompleteContext;
  lookupData: Promise<AutocompleteLookupData[]>;
}

const isPreviousCharContent = (dom: DOMUtils, leaf: Spot.SpotPoint<Node>) => {
  // If at the start of the range, then we need to look backwards one more place. Otherwise we just need to look at the current text
  const root = dom.getParent(leaf.container, dom.isBlock) ?? dom.getRoot();
  // Zero width characters (e.g. of the caret container left by toggling a format without a selection) are no content
  const skipZwsp = (element: Text, offset: number) => {
    let start = offset;
    while (start > 0 && Zwsp.isZwsp(element.data.charAt(start - 1))) {
      start--;
    }
    return start === 0 ? -1 : start;
  };
  return TextSearch.repeatLeft(dom, leaf.container, leaf.offset, skipZwsp, root).filter((spot) => {
    const char = spot.container.data.charAt(spot.offset - 1);
    return !isWhitespace(char);
  }).isSome();
};

const isStartOfWord = (dom: DOMUtils) => (rng: Range) => {
  const leaf = TextDescent.toLeaf(rng.startContainer, rng.startOffset);
  return !isPreviousCharContent(dom, leaf);
};

const getTriggerContext = (dom: DOMUtils, initRange: Range, database: AutocompleterDatabase): Optional<AutocompleteContext> => Arr.findMap(database.triggers, (trigger) => getContext(dom, initRange, trigger));

const lookup = (editor: Editor, getDatabase: () => AutocompleterDatabase): Optional<AutocompleteLookupInfo> => {
  const database = getDatabase();
  const rng = editor.selection.getRng();

  return getTriggerContext(editor.dom, rng, database).bind((context) => lookupWithContext(editor, getDatabase, context));
};

const lookupWithContext = (editor: Editor, getDatabase: () => AutocompleterDatabase, context: AutocompleteContext, fetchOptions: Record<string, any> = {}): Optional<AutocompleteLookupInfo> => {
  const database = getDatabase();
  const rng = editor.selection.getRng();
  const startText = rng.startContainer.nodeValue ?? '';

  const autocompleters = Arr.filter(database.lookupByTrigger(context.trigger), (autocompleter) => context.text.length >= autocompleter.minChars && autocompleter.matches.getOrThunk(() => isStartOfWord(editor.dom))(context.range, startText, context.text));

  if (autocompleters.length === 0) {
    return Optional.none();
  }

  const lookupData = Promise.all(Arr.map(autocompleters, (ac) => {
    // TODO: Find a sensible way to do maxResults
    const fetchResult = ac.fetch(context.text, ac.maxResults, fetchOptions);
    return fetchResult.then((results) => ({
      matchText: context.text,
      items: results,
      columns: ac.columns,
      onAction: ac.onAction,
      highlightOn: ac.highlightOn
    }));
  }));

  return Optional.some({
    lookupData,
    context
  });
};

export {
  lookup,
  lookupWithContext
};
