import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';


import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { CustomList } from 'ephox/alloy/api/ui/CustomList';
import { Toolbar } from 'ephox/alloy/api/ui/Toolbar';
import { ToolbarGroup } from 'ephox/alloy/api/ui/ToolbarGroup';

UnitTest.asynctest('MultipleToolbarTest', (success, failure) => {
  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    CustomList.sketch({
      uid: 'multiple-toolbar',
      dom: {
        tag: 'div',
        classes: [ 'test-multiple-toolbar' ]
      },
      shell: true,
      makeItem: () => Toolbar.sketch(
        {
          dom: {
            tag: 'div',
            classes: [ 'test-single-toolbar' ]
          },
          components: [ ]
        }
      ),
      setupItem: (_mToolbar: AlloyComponent, tc: AlloyComponent, data: any, _index: number) => {
        Toolbar.setGroups(tc, data);
      }
    })
  ), (doc, _body, _gui, component, _store) => {

    const makeToolbarItem = (itemSpec: { text: string }): AlloySpec => ({
      dom: {
        tag: 'button',
        classes: [ 'test-toolbar-item' ],
        innerHtml: itemSpec.text
      }
    });

    const makeToolbarGroup = (group: { items: AlloySpec[] }) => {
      const spec = group;
      return {
        dom: {
          tag: 'div',
          classes: [ 'test-toolbar-group' ]
        },

        components: [
          ToolbarGroup.parts.items({ })
        ],

        items: spec.items,
        markers: {
          itemSelector: '.test-toolbar-item'
        }
      };
    };

    const toolbar = ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('test-single-toolbar') ],
      children: [
        s.element('div', {
          classes: [ arr.has('test-toolbar-group') ],
          children: [
            s.element('button', { html: str.is('A') }),
            s.element('button', { html: str.is('B') })
          ]
        }),
        s.element('div', {
          classes: [ arr.has('test-toolbar-group') ],
          children: [
            s.element('button', { html: str.is('C') }),
            s.element('button', { html: str.is('D') })
          ]
        }),
        s.element('div', {
          classes: [ arr.has('test-toolbar-group') ],
          children: [
            s.element('button', { html: str.is('E') }),
            s.element('button', { html: str.is('F') }),
            s.element('button', { html: str.is('G') })
          ]
        })
      ]
    }));

    const sAssertMultipleToolbars = (label: string) => Assertions.sAssertStructure(
      label,
      ApproxStructure.build((s, _str, arr) => s.element('div', {
        classes: [ arr.has('test-multiple-toolbar') ],
        children: [
          toolbar,
          toolbar,
          toolbar
        ]
      })),
      component.element
    );

    const toolbarList = component.getSystem().getByUid('multiple-toolbar').getOrDie();

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-single-toolbar { display: flex; }',
        '.test-single-toolbar button { width: 100px; }'
      ]),

      Step.sync(() => {

        const groups = [
          { items: [{ text: 'A' }, { text: 'B' }].map(makeToolbarItem) },
          { items: [{ text: 'C' }, { text: 'D' }].map(makeToolbarItem) },
          { items: [{ text: 'E' }, { text: 'F' }, { text: 'G' }].map(makeToolbarItem) }
        ].map(makeToolbarGroup)[{ text: 'A' }, { text: 'B' }].map(makeToolbarItem) },
          { items: [{ text: 'C' }, { text: 'D' }].map(makeToolbarItem) },
          { items: [{ text: 'E' }, { text: 'F' }, { text: 'G' }].map(makeToolbarItem) }
        ], makeToolbarGroup);

        CustomList.setItems(toolbarList, [
          groups.map(ToolbarGroup.sketch),
          groups.map(ToolbarGroup.sketch),
          groups.map(ToolbarGroup.sketch)
        ]);
      }),

      sAssertMultipleToolbars('Checking structure of multiple toolbars'),

      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});
