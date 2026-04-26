import { AddEventsBehaviour, AlloyEvents, Behaviour, SimpleSpec } from '@ephox/alloy';
import { Attribute, SelectorFind } from '@ephox/sugar';

import I18n from 'hugerte/core/api/util/I18n';

export type IconProvider = () => Record<string, string>;

interface IconSpec {
  readonly tag: string;
  readonly classes: string[];
  readonly attributes?: Record<string, string>;
  readonly behaviours?: Array<Behaviour.NamedConfiguredBehaviour<any, any, any>>;
}

// Icons that need to be transformed in RTL
const rtlTransform: Record<string, boolean> = {
  'indent': true,
  'outdent': true,
  'table-insert-column-after': true,
  'table-insert-column-before': true,
  'paste-column-after': true,
  'paste-column-before': true,
  'unordered-list': true,
  'list-bull-circle': true,
  'list-bull-default': true,
  'list-bull-square': true
};

const defaultIconName = 'temporary-placeholder';

const defaultIcon = (icons: Record<string, string>) => (): string =>
  ((icons)[defaultIconName] ?? null) ?? ('!not found!');

const getIconName = (name: string, icons: Record<string, string>): string => {
  const lcName = name.toLowerCase();
  // If in rtl mode then try to see if we have a rtl icon to use instead
  if (I18n.isRtl()) {
    const rtlName = ((lcName).endsWith('-rtl') ? (lcName) : (lcName) + ('-rtl'));
    return Object.prototype.hasOwnProperty.call(icons, rtlName) ? rtlName : lcName;
  } else {
    return lcName;
  }
};

const lookupIcon = (name: string, icons: Record<string, string>): (string) | null =>
  ((icons)[getIconName(name, icons)] ?? null);

const get = (name: string, iconProvider: IconProvider): string => {
  const icons = iconProvider();
  return lookupIcon(name, icons).getOrThunk(defaultIcon(icons));
};

const getOr = (name: string, iconProvider: IconProvider, fallbackIcon: (string) | null): string => {
  const icons = iconProvider();
  return lookupIcon(name, icons).or(fallbackIcon).getOrThunk(defaultIcon(icons));
};

const getFirst = (names: string[], iconProvider: IconProvider): string => {
  const icons = iconProvider();
  return ((names) as any[]).reduce<any>((acc: any, x: any) => acc !== null ? acc : ((name) => lookupIcon(name, icons))(x), null).getOrThunk(defaultIcon(icons));
};

const needsRtlTransform = (iconName: string): boolean =>
  I18n.isRtl() ? Object.prototype.hasOwnProperty.call(rtlTransform, iconName) : false;

const addFocusableBehaviour = (): Behaviour.NamedConfiguredBehaviour<any, any, any> =>
  AddEventsBehaviour.config('add-focusable', [
    AlloyEvents.runOnAttached((comp) => {
      // set focusable=false on SVGs to prevent focusing the toolbar when tabbing into the editor
      SelectorFind.child(comp.element, 'svg').each((svg) => Attribute.set(svg, 'focusable', 'false'));
    })
  ]);

const renderIcon = (spec: IconSpec, iconName: string, icons: Record<string, string>, fallbackIcon: (string) | null): SimpleSpec => {
  // If RTL, add the flip icon class if the icon doesn't have a `-rtl` icon available.
  const rtlIconClasses = needsRtlTransform(iconName) ? [ 'tox-icon--flip' ] : [];
  const iconHtml = ((icons)[getIconName(iconName, icons)] ?? null).or(fallbackIcon).getOrThunk(defaultIcon(icons));
  return {
    dom: {
      tag: spec.tag,
      attributes: spec.attributes ?? {},
      classes: spec.classes.concat(rtlIconClasses),
      innerHtml: iconHtml
    },
    behaviours: Behaviour.derive([
      ...spec.behaviours ?? [],
      addFocusableBehaviour()
    ])
  };
};

const render = (iconName: string, spec: IconSpec, iconProvider: IconProvider, fallbackIcon: (string) | null = null): SimpleSpec =>
  renderIcon(spec, iconName, iconProvider(), fallbackIcon);

const renderFirst = (iconNames: string[], spec: IconSpec, iconProvider: IconProvider): SimpleSpec => {
  const icons = iconProvider();
  const iconName = ((iconNames).find((name) => Object.prototype.hasOwnProperty.call(icons, getIconName(name, icons))) ?? null);
  return renderIcon(spec, iconName ?? (defaultIconName), icons, null);
};

export {
  get,
  getFirst,
  getOr,
  render,
  renderFirst,
  addFocusableBehaviour,
  needsRtlTransform
};
