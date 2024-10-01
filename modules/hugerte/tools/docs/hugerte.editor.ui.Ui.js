/**
 * This editor ui instance.
 *
 * @class hugerte.editor.ui.Ui
 */

/**
 * Editor UI registry instance.
 *
 * @property registry
 * @type hugerte.editor.ui.Registry
 */

/**
 * Reveals the editor user interface for inline editors. This method affects all user
 * interface elements, including: menu bar, toolbar, notifications, and dialogs.
 * <br>
 * If the `toolbar_persist` option is set to `true` and this method is used,
 * the user interface will remain visible, regardless of focus.
 *
 * @method hugerte.editor.ui.show
 */

/**
 * Hides the editor user interface for inline editors. This method affects all user
 * interface elements, including: menu bar, toolbar, notifications, and dialogs.
 * <br>
 * If the `toolbar_persist` option is set to `true` and this method is used,
 * the user interface will remain hidden, regardless of focus.
 *
 * @method hugerte.editor.ui.hide
 */

/**
 * Sets the state of editor user interface as `enabled` (`true`) or `disabled` (`false`).
 * This method affects all user interface elements, including: menu bar,
 * toolbar, notifications, and dialogs. Can not be set to 'true' when in readonly mode.
 *
 * @method hugerte.editor.ui.setEnabled
 * @param {Boolean} state The state in which to set the user interface.
 */

/**
 * Determines if the editor user interface is `enabled` (`true`) or `disabled` (`false`).
 *
 * @method hugerte.editor.ui.isEnabled
 * @return {Boolean} true/false if the editor user interface is enabled (`true`) or disabled (`false`).
 */

/**
 * Editor UI stylesheet loader instance. StyleSheetLoader for styles in the editor UI. For content styles, use editor.dom.styleSheetLoader.
 *
 * @property styleSheetLoader
 * @type hugerte.dom.StyleSheetLoader
 */
