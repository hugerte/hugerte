import PluginManager from 'hugerte/core/api/PluginManager';
import PasteFromWord from './core/PasteHandler';

export default (): void => {
  PluginManager.add('cleanpaste', (editor) => {
    const pFWord = new PasteFromWord({
      ignorePasteSingleFile: false,
      imageHandler: (blob, callback) => {
        try {
          if (!(blob instanceof Blob)) {
            throw new TypeError('Provided parameter is not of type Blob');
          }
  
          // console.log('Image blob:', blob);
          // console.log('Blob type:', JSON.stringify(blob));
  
          const reader = new FileReader();
          reader.onloadend = () => callback(reader.result);
  
          reader.onerror = (error) => {
            console.error('FileReader error:', error);
            callback(null); // Pass null to the callback in case of an error
          };

          reader.readAsDataURL(blob);
        } catch (error) {
          console.error('Error in imageHandler:', error);
          callback(null); // Pass null to the callback in case of an error
        }
      }
    });

    // Bind to the paste event
    editor.on("paste", (event) => {
      event.preventDefault();
      function handlePastedContent(data) {
        try {
          // console.log('Cleaned HTML:', data.html);
          // console.log('Plain text:', data.text);
          editor.execCommand('mceInsertContent', false, data.html);
        } catch (error) {
          console.error('Error handling pasted content:', error);
        }
      }
      pFWord.parse(event, handlePastedContent);
    });
  });
};
