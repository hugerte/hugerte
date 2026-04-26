
import { Entry, EntryList, isEntryList } from './Entry';

const cloneListProperties = (target: Entry, source: Entry): void => {
  if (isEntryList(target) && isEntryList(source)) {
    target.listType = source.listType;
    target.listAttributes = { ...source.listAttributes };
  }
};

const cleanListProperties = (entry: EntryList): void => {
  // Remove the start attribute if generating a new list
  entry.listAttributes = Object.fromEntries(Object.entries(entry.listAttributes).filter(([_k, _v]: [any, any]) => ((_value, key) => key !== 'start')(_v, _k as any)));
};

// Closest entry above/below in the same list
const closestSiblingEntry = (entries: Entry[], start: number): (Entry) | null => {
  const depth = entries[start].depth;
  // Ignore dirty items as they've been moved and won't have the right list data yet
  const matches = (entry: Entry) => entry.depth === depth && !entry.dirty;
  const until = (entry: Entry) => entry.depth < depth;

  // Check in reverse to see if there's an entry as the same depth before the current entry
  // but if not, then try to walk forwards as well
  return ((_xs: any, _pred: any, _until: any) => { for (let _i = 0; _i < _xs.length; _i++) { const _x = _xs[_i]; if (_pred(_x, _i)) return _x; if (_until(_x, _i)) break; } return null; })([...(entries.slice(0, start))].reverse(), matches, until)
    .orThunk(() => ((_xs: any, _pred: any, _until: any) => { for (let _i = 0; _i < _xs.length; _i++) { const _x = _xs[_i]; if (_pred(_x, _i)) return _x; if (_until(_x, _i)) break; } return null; })(entries.slice(start + 1), matches, until));
};

const normalizeEntries = (entries: Entry[]): Entry[] => {
  (entries).forEach((entry, i) => {
    closestSiblingEntry(entries, i).fold(
      () => {
        if (entry.dirty && isEntryList(entry)) {
          cleanListProperties(entry);
        }
      },
      (matchingEntry) => cloneListProperties(entry, matchingEntry)
    );
  });
  return entries;
};

export {
  normalizeEntries
};
