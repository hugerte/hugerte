import { ApproxStructure, Assertions, UiFinder } from '@ephox/agar';
import { AlloyComponent, GuiFactory, Memento, Representing, TestHelpers } from '@ephox/alloy';
import { describe, it } from '@ephox/bedrock-client';

import { Ready } from '@ephox/sugar';
import { assert } from 'chai';

import { ImagePreviewDataSpec, renderImagePreview } from 'hugerte/themes/silver/ui/dialog/ImagePreview';

describe('headless.hugerte.themes.silver.components.imagepreview.BasicImagePreviewTest', () => {
  const testImageUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const memImagePreview = Memento.record(renderImagePreview({
    name: 'test-panel',
    height: '200px',
  }, null));

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    {
      dom: {
        tag: 'div',
        styles: {
          width: '200px'
        }
      },
      components: [
        memImagePreview.asSpec()
      ]
    }
  ));

  const findImage = (component: AlloyComponent) => UiFinder.findIn<HTMLImageElement>(component.element, 'img').getOrDie();

  const assertImageState = (label: string, component: AlloyComponent, url: string) => {
    const node = findImage(component).dom;
    assert.equal(node.src, url, label + ' - checking "src" attribute');
  };

  const setPanelState = (component: AlloyComponent, state: ImagePreviewDataSpec) => {
    const imagePreview = memImagePreview.get(component);
    Representing.setValue(imagePreview, state);
  };

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, str, arr) =>
        // the component is a wrapper div just there to set a known width, the image preview is the child
        s.element('div', {
          children: [
            s.element('div', {
              classes: [ arr.has('tox-imagepreview') ],
              styles: {
                height: str.is('200px')
              },
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-imagepreview__container') ],
                  children: [
                    s.element('img', {
                      classes: [ arr.has('tox-imagepreview__image') ],
                    }),
                  ]
                })
              ]
            })
          ],
        })),
      hook.component().element
    );
  });

  it('URL update', () => {
    const component = hook.component();
    assertImageState('Initial image panel state', component, '');
    setPanelState(component, {
      url: testImageUrl,
      zoom: null,
      cachedWidth: null,
      cachedHeight: null,
    });
    assertImageState('set URL state', component, testImageUrl);
  });

  it('zoom update', async () => {
    const component = hook.component();
    setPanelState(component, {
      url: testImageUrl,
      zoom: 1.5,
      cachedWidth: null,
      cachedHeight: null,
    });
    await Ready.image(findImage(component));
    Assertions.assertStructure(
      'Checking structure after zoom',
      ApproxStructure.build((s, str, arr) =>
        // the component is a wrapper div just there to set a known width, the image preview is the child
        s.element('div', {
          children: [
            s.element('div', {
              classes: [ arr.has('tox-imagepreview') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-imagepreview__container') ],
                  styles: {
                    top: str.is('99.25px'),
                    left: str.is('99.25px'),
                    width: str.is('1.5px'),
                    height: str.is('1.5px')
                  }
                })
              ]
            })
          ]
        })),
      hook.component().element
    );
  });
});
