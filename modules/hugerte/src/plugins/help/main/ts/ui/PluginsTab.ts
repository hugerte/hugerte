
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
    if (typeof (getMetadata) === 'function') {
      const metadata = getMetadata();
      return { name: metadata.name, html: makeLink(metadata) };
    } else {
      return { name: key, html: key };
    }
  };

  const getPluginData = (editor: Editor, key: string): PluginData => ((PluginUrls.urls).find((x) => {
    return x.key === key;
  }) ?? null).fold(() => {
    return identifyUnknownPlugin(editor, key);
  }, (x) => {
    // We know this plugin, so use our stored details.
    const html = makeLink({ name: x.name, url: `https://www.hugerte.org/docs/hugerte/1/${x.slug}/` });
    return { name: x.name, html };
  });

  const getPluginKeys = (editor: Editor) => {
    const keys = Object.keys(editor.plugins);
    const forcedPlugins = Options.getForcedPlugins(editor);

    return (forcedPlugins) === undefined ?
      keys :
      (keys).filter((k) => !(forcedPlugins).includes(k));
  };

  const pluginLister = (editor: Editor) => {
    const pluginKeys = getPluginKeys(editor);
    const sortedPluginData = [...((pluginKeys).map((k) => getPluginData(editor, k)))].sort((pd1, pd2) => pd1.name.localeCompare(pd2.name));

    const pluginLis = (sortedPluginData).map((key) => {
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

