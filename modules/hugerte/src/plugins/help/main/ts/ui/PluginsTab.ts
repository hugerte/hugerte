import { Arr, Obj, Type } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';
import { Dialog } from 'hugerte/core/api/ui/Ui';
import I18n from 'hugerte/core/api/util/I18n';

import * as Options from '../api/Options';
import * as PluginUrls from '../data/PluginUrls';

interface PluginData {
  // The name is just used for sorting alphabetically.
  readonly name: string;
  readonly html: string;
}

const tab = (editor: Editor): Dialog.TabSpec & { name: string } => {
  const makeLink = (p: { name: string; url: string }): string =>
    `<a data-alloy-tabstop="true" tabindex="-1" href="${p.url}" target="_blank" rel="noopener">${p.name}</a>`;

  const identifyUnknownPlugin = (editor: Editor, key: string): PluginData => {
    const getMetadata = editor.plugins[key].getMetadata;
    if (Type.isFunction(getMetadata)) {
      const metadata = getMetadata();
      return { name: metadata.name, html: makeLink(metadata) };
    } else {
      return { name: key, html: key };
    }
  };

  const getPluginData = (editor: Editor, key: string): PluginData => Arr.find(PluginUrls.urls, (x) => {
    return x.key === key;
  }).fold(() => {
    return identifyUnknownPlugin(editor, key);
  }, (x) => {
    // We know this plugin, so use our stored details.
    const html = makeLink({ name: x.name, url: `https://www.hugerte.org/docs/hugerte/1/${x.slug}/` });
    return { name: x.name, html };
  });

  const getPluginKeys = (editor: Editor) => {
    const keys = Obj.keys(editor.plugins);
    const forcedPlugins = Options.getForcedPlugins(editor);

    return Type.isUndefined(forcedPlugins) ?
      keys :
      Arr.filter(keys, (k) => !Arr.contains(forcedPlugins, k));
  };

  const pluginLister = (editor: Editor) => {
    const pluginKeys = getPluginKeys(editor);
    const sortedPluginData = Arr.sort(
      Arr.map(pluginKeys, (k) => getPluginData(editor, k)),
      (pd1, pd2) => pd1.name.localeCompare(pd2.name)
    );

    const pluginLis = Arr.map(sortedPluginData, (key) => {
      return '<li>' + key.html + '</li>';
    });
    const count = pluginLis.length;
    const pluginsString = pluginLis.join('');

    const html = '<p><b>' + I18n.translate([ 'Plugins installed ({0}):', count ]) + '</b></p>' +
      '<ul>' + pluginsString + '</ul>';

    return html;
  };

  const installedPlugins = (editor: Editor) => {
    if (editor == null) {
      return '';
    }
    return '<div>' +
      pluginLister(editor) +
      '</div>';
  };

  const htmlPanel: Dialog.HtmlPanelSpec = {
    type: 'htmlpanel',
    presets: 'document',
    html: [
      installedPlugins(editor)
    ].join('')
  };
  return {
    name: 'plugins',
    title: 'Plugins',
    items: [
      htmlPanel
    ]
  };
};

export {
  tab
};

