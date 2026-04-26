import { AlloySpec, Behaviour, FormField as AlloyFormField, GuiFactory, RawDomSchema, SketchSpec } from '@ephox/alloy';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

type FormFieldSpec = Parameters<typeof AlloyFormField['sketch']>[0];

const renderFormFieldWith = (pLabel: (AlloySpec) | null, pField: AlloySpec, extraClasses: string[], extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]): SketchSpec => {
  const spec = renderFormFieldSpecWith(pLabel, pField, extraClasses, extraBehaviours);
  return AlloyFormField.sketch(spec);
};

const renderFormField = (pLabel: (AlloySpec) | null, pField: AlloySpec): SketchSpec =>
  renderFormFieldWith(pLabel, pField, [ ], [ ]);

const renderFormFieldSpec = (pLabel: (AlloySpec) | null, pField: AlloySpec): FormFieldSpec => ({
  dom: renderFormFieldDom(),
  components: pLabel.toArray().concat([ pField ])
});

const renderFormFieldSpecWith = (
  pLabel: (AlloySpec) | null,
  pField: AlloySpec,
  extraClasses: string[],
  extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[]
): FormFieldSpec => ({
  dom: renderFormFieldDomWith(extraClasses),
  components: pLabel.toArray().concat([ pField ]),
  fieldBehaviours: Behaviour.derive(extraBehaviours)
});

const renderFormFieldDom = (): RawDomSchema => renderFormFieldDomWith([ ]);

const renderFormFieldDomWith = (extraClasses: string[]): RawDomSchema => ({
  tag: 'div',
  classes: [ 'tox-form__group' ].concat(extraClasses)
});

const renderLabel = (label: string, providersBackstage: UiFactoryBackstageProviders): AlloySpec =>
  AlloyFormField.parts.label({
    dom: {
      tag: 'label',
      classes: [ 'tox-label' ]
    },
    components: [
      GuiFactory.text(providersBackstage.translate(label))
    ]
  });

export {
  renderFormField,
  renderFormFieldWith,
  renderFormFieldSpec,
  renderFormFieldDom,
  renderLabel
};
