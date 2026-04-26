import { Arr } from '@ephox/katamari';
import { InsertAll, Remove, SugarElement, SugarFragment } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';

import { fireListEvent } from '../api/Events';
import { ListAction } from '../core/ListAction';
import * as Selection from '../core/Selection';
import { createTextBlock } from '../core/TextBlock';
import { composeList } from './ComposeList';
import { Entry, isEntryComment, isIndented, isSelected } from './Entry';
import { Indentation, indentEntry } from './Indentation';
import { normalizeEntries } from './NormalizeEntries';
import { EntrySet, ItemSelection, parseLists } from './ParseLists';
import { hasFirstChildList } from './Util';

const outdentedComposer = (editor: Editor, entries: Entry[]): SugarElement<DocumentFragment>[] => {
  const normalizedEntries = normalizeEntries(entries);
  return (normalizedEntries).map((entry) => {
    const content = !isEntryComment(entry)
      ? SugarFragment.fromElements(entry.content)
      : SugarFragment.fromElements([ SugarElement.fromHtml(`<!--${entry.content}-->`) ]);
    return SugarElement.fromDom(createTextBlock(editor, content.dom));
  });
};

const indentedComposer = (editor: Editor, entries: Entry[]): SugarElement<HTMLElement>[] => {
  const normalizedEntries = normalizeEntries(entries);
  return composeList(editor.contentDocument, normalizedEntries).toArray();
};

const composeEntries = (editor: Editor, entries: Entry[]): SugarElement<Node>[] =>
  (Arr.groupBy(entries, isIndented)).flatMap((entries): SugarElement<Node>[] => {
    const groupIsIndented = ((entries)[0] ?? null).exists(isIndented);
    return groupIsIndented ? indentedComposer(editor, entries) : outdentedComposer(editor, entries);
  });

const indentSelectedEntries = (entries: Entry[], indentation: Indentation): void => {
  ((entries).filter(isSelected)).forEach((entry) => indentEntry(indentation, entry));
};

const getItemSelection = (editor: Editor): (ItemSelection) | null => {
  const selectedListItems = (Selection.getSelectedListItems(editor)).map(SugarElement.fromDom);

  return (((selectedListItems).find(((x: any) => !(hasFirstChildList)(x))) ?? null) !== null && (([...(selectedListItems)].reverse()).find(((x: any) => !(hasFirstChildList)(x))) ?? null) !== null ? ((start, end) => ({ start, end }))(((selectedListItems).find(((x: any) => !(hasFirstChildList)(x))) ?? null), (([...(selectedListItems)].reverse()).find(((x: any) => !(hasFirstChildList)(x))) ?? null)) : null);
};

const listIndentation = (editor: Editor, lists: SugarElement<HTMLElement>[], indentation: Indentation): void => {
  const entrySets: EntrySet[] = parseLists(lists, getItemSelection(editor));

  (entrySets).forEach((entrySet) => {
    indentSelectedEntries(entrySet.entries, indentation);
    const composedLists = composeEntries(editor, entrySet.entries);
    (composedLists).forEach((composedList) => {
      fireListEvent(editor, indentation === Indentation.Indent ? ListAction.IndentList : ListAction.OutdentList, composedList.dom);
    });
    InsertAll.before(entrySet.sourceList, composedLists);
    Remove.remove(entrySet.sourceList);
  });
};

export { listIndentation };
