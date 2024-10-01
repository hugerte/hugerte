/**
 * This file contains the documentation for the Editor API.
 */

/**
 * Schema instance, enables you to validate elements and its children.
 *
 * @property schema
 * @type hugerte.html.Schema
 */

/**
 * DOM instance for the editor.
 *
 * @property dom
 * @type hugerte.dom.DOMUtils
 * @example
 * // Adds a class to all paragraphs within the editor
 * hugerte.activeEditor.dom.addClass(hugerte.activeEditor.dom.select('p'), 'someclass');
 */

/**
 * HTML parser will be used when contents is inserted into the editor.
 *
 * @property parser
 * @type hugerte.html.DomParser
 */

/**
 * DOM serializer for the editor. Will be used when contents is extracted from the editor.
 *
 * @property serializer
 * @type hugerte.dom.Serializer
 * @example
 * // Serializes the first paragraph in the editor into a string
 * hugerte.activeEditor.serializer.serialize(hugerte.activeEditor.dom.select('p')[0]);
 */

/**
 * Selection instance for the editor.
 *
 * @property selection
 * @type hugerte.dom.Selection
 * @example
 * // Sets some contents to the current selection in the editor
 * hugerte.activeEditor.selection.setContent('Some contents');
 *
 * // Gets the current selection
 * alert(hugerte.activeEditor.selection.getContent());
 *
 * // Selects the first paragraph found
 * hugerte.activeEditor.selection.select(hugerte.activeEditor.dom.select('p')[0]);
 */

/**
 * Formatter instance.
 *
 * @property formatter
 * @type hugerte.Formatter
 */

/**
 * Undo manager instance, responsible for handling undo levels.
 *
 * @property undoManager
 * @type hugerte.UndoManager
 * @example
 * // Undoes the last modification to the editor
 * hugerte.activeEditor.undoManager.undo();
 */

/**
 * Is set to true after the editor instance has been initialized
 *
 * @property initialized
 * @type Boolean
 * @example
 * const isEditorInitialized = (editor) => {
 *   return editor && editor.initialized;
 * }
 */

/**
 * Window manager reference, use this to open new windows and dialogs.
 *
 * @property windowManager
 * @type hugerte.WindowManager
 * @example
 * // Shows an alert message
 * hugerte.activeEditor.windowManager.alert('Hello world!');
 *
 * // Opens a new dialog with the file.htm file and the size 320x240
 * hugerte.activeEditor.windowManager.openUrl({
 *   title: 'Custom Dialog',
 *   url: 'file.htm',
 *   width: 320,
 *   height: 240
 * });
 */

/**
 * Notification manager reference, use this to open new windows and dialogs.
 *
 * @property notificationManager
 * @type hugerte.NotificationManager
 * @example
 * // Shows a notification info message.
 * hugerte.activeEditor.notificationManager.open({
 *   text: 'Hello world!',
 *   type: 'info'
 * });
 */

/**
 * Reference to the theme instance that was used to generate the UI.
 *
 * @property theme
 * @type hugerte.Theme
 * @example
 * // Executes a method on the theme directly
 * hugerte.activeEditor.theme.someMethod();
 */
