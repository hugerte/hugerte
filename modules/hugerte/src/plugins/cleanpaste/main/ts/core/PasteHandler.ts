import { EditorEvent } from 'hugerte/core/api/PublicApi';
import { dataTools, RTFTools, imageTools } from './Utils';
import DOMPurify from 'dompurify';

/*
TODO
This plugin handles the pasting of content from Microsoft Word into a web application. It includes methods for:

1. Detecting if the pasted content is from Word.
2. Cleaning the pasted HTML content by removing Word-specific tags and attributes.
3. Converting Word-specific lists to proper HTML lists.
4. Extracting and handling images from the clipboard data, including those in RTF format.
5. Converting blob URLs to base64 strings and replacing them in the HTML content.
6. Handling single file paste operations.
*/

class PasteFromWord {
  private config;
  private dompurifyConfig;

  constructor(config = {}) {
    this.config = config;
    this.dompurifyConfig = {
        ALLOWED_TAGS: ['img', 'p', 'span', 'div', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'b', 'i', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: {
          '*': ['class', 'id', 'style', 'title'],
          'a': ['href'],
          'img': ['src', 'alt', 'title', 'width', 'height', 'data-*']
        },
        ADD_ATTR: ['src', 'style', 'data-*'], // Ensure the 'src' and 'style' attributes are allowed
        ADD_TAGS: ['img'],
        ALLOW_DATA_ATTR: true, // Allow data attributes
        KEEP_CONTENT: true, // Keep the inline styles
      };
  }

  get supportedImageTypes() {
    return ['image/png', 'image/jpeg', 'image/gif'];
  }

  parse = (pasteEvent: EditorEvent<ClipboardEvent>, next: { (data: any): void; (arg0: { html: TrustedHTML & Node & DocumentFragment & string; text: any; }): void; }) => {

    console.log('Paste Event: ', pasteEvent);
    
    const clipboardData = pasteEvent.clipboardData;
    if (clipboardData === null) return false; // TODO just to make ts happy!
    console.log('Clipboard Data Types: ', clipboardData.types);

    if (this.checkPaster(clipboardData)) {
      this.parser(clipboardData, next);
    } else {
      const htmlData = this.getClipboardData(clipboardData, 'text/html');
      const textData = this.getClipboardData(clipboardData, 'text/plain');
      console.log('HTML Data: ', htmlData);
      console.log('Text Data: ', textData);

      next({
        html: DOMPurify.sanitize(htmlData, this.dompurifyConfig),
        text: textData,
      });
    }
  };

  checkPaster = (paster: any) => {
    const mswordHtml = this.getClipboardData(paster, 'text/html');
    const generatorName = this.getContentGeneratorName(mswordHtml);
    const wordRegexp =
      /(class="?Mso|style=["'][^"]*?\bmso\-|w:WordDocument|<o:\w+>|<\/font>)/;
    const isOfficeContent = generatorName
      ? generatorName === 'microsoft'
      : wordRegexp.test(mswordHtml);

    console.log('is Word?', { mswordHtml, generatorName, isOfficeContent });
    return mswordHtml && isOfficeContent;
  };

  getClipboardData = (data: { getData: (arg0: any) => any; }, type: string) => data.getData(type);

  getContentGeneratorName = (content: string) => {
    const metaGeneratorTag =
      /<meta\s+name=["']?generator["']?\s+content=["']?(\w+)/gi;
    const result = metaGeneratorTag.exec(content);

    if (!result || !result.length) return undefined;

    const generatorName = result[1].toLowerCase();
    if (generatorName.startsWith('microsoft')) return 'microsoft';
    if (generatorName.startsWith('libreoffice')) return 'libreoffice';

    return 'unknown';
  };

  parser = (paster: { files: any[]; }, next: (arg0: { html: string; text: any; }) => void) => {
    
    const mswordHtml = this.cleanWordHtml(
      this.getClipboardData(paster, 'text/html')
    );


    const plainText = this.getClipboardData(paster, 'text/plain');
    const file = paster.files[0];
    const dataTransferRtf = this.getClipboardData(paster, 'text/rtf');
    const pfwEvtData = { html: mswordHtml, text: plainText };

    if (file && !this.config.ignorePasteSingleFile) {
      this.handleSingleFile(file).then((res) => {
        pfwEvtData.html =  DOMPurify.sanitize(res, this.dompurifyConfig);
        next(pfwEvtData);
      });
    } else {
    console.log('RTF Data: ', pfwEvtData.html);
      this.filterRtfImageToHtml(pfwEvtData.html, dataTransferRtf).then(
        (res) => {
          pfwEvtData.html =  DOMPurify.sanitize(res || plainText , this.dompurifyConfig);
          next(pfwEvtData);
        }
      );
    }
  };

  cleanWordHtml = (html: string) => {
    // Create a DOM parser to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract styles from the head
    const styleMap = this.extractStylesFromHead(doc);

    // convert Word-specific lists to proper HTML lists
    this.convertWordLists(doc);

    // Remove Word-specific tags
    const wordTags = ['o:p', 'v:shape', 'v:imagedata'];
    wordTags.forEach((tag) => {
      const elements = doc.getElementsByTagName(tag);

      while (elements.length > 0) {
        // log out the elements[0] html
        console.log(elements[0].outerHTML);

        elements[0].parentNode.removeChild(elements[0]);
      }
    });

    // Remove Word-specific attributes
    const allElements = doc.getElementsByTagName('*');
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      for (let j = element.attributes.length - 1; j >= 0; j--) {
        const attr = element.attributes[j].name;
        if (
          attr.startsWith('mso-') ||
          attr.startsWith('v:') ||
          attr.startsWith('xmlns:')
        ) {
          element.removeAttribute(attr);
        }
      }
      // if element contains no content, remove it
      if (!element.hasChildNodes() && !element.hasAttribute('src')) {
        element.parentNode.removeChild(element);
      }
    }

    // Replace Word-specific classes with inline styles
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];

      const classList = element.classList;

      // get the style object for the element (e.g., H1, H2, H3, P, etc.)
      const styleObjMap = styleMap[element.tagName.toLowerCase()];

      if (styleObjMap) {
        // styleObjMap is a Map object, so should be in the same order as the classes are written in words style tag
        // this means we can loop over the classList and check if the class name is in the styleObjMap, knowing that the first class in the classList will match the first key in the styleObjMap
        // this preserving order of classes in the style tag

        // first check to see if the tyleObjMap has a tag property
        if (styleObjMap.has('tag')) {
          console.log('tag property found');
          // get the style object for the tag
          const tagStyle = styleObjMap.get('tag');
          const existingStyle = element.getAttribute('style') || '';
          element.setAttribute('style', `${existingStyle} ${tagStyle}`);
        }

        for (let className of classList) {
          // check if styleObjMap has a key that matches the class name
          if (styleObjMap.has(className)) {
            console.log('class name found in styleObjMap');
            // get the style object for the class name
            const classStyle = styleObjMap.get(className);
            // add the style string to the element's style attribute
            const existingStyle = element.getAttribute('style') || '';
            element.setAttribute('style', `${existingStyle} ${classStyle}`);
            // remove the class name from the element
            element.classList.remove(className);
          }
        }
      }
    }

    // Remove Word-specific styles
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      if (element.hasAttribute('style')) {
        const styles = element.getAttribute('style')!.split(';');
        const filteredStyles = styles.filter(
          (style) => !style.trim().startsWith('mso-')
        );
        if (filteredStyles.length > 0) {
          element.setAttribute('style', filteredStyles.join(';'));
        } else {
          element.removeAttribute('style');
        }
        // if style attribute is empty, remove it
        if (
          element.hasAttribute('style') &&
          !element.getAttribute('style')!.trim()
        ) {
          element.removeAttribute('style');
        }
      }
    }

    // Manually remove conditional comments
    const conditionalCommentRegExp =
      /<!--\[if [^\]]*\]>[\s\S]*?<!\[endif\]-->/gi;
    const cleanedHtml = doc.documentElement.outerHTML.replace(
      conditionalCommentRegExp,
      ''
    );

    // Extract the content inside the body tag
    const bodyContent = doc.body ? doc.body.innerHTML : cleanedHtml;

    // Serialize the cleaned document back to a string
    return bodyContent
  };

  extractStylesFromHead = (doc: Document) => {
    const styleMap: Record<string, Map<string, string>> = {};
    const styles = doc.head.querySelectorAll('style');

    if (styles.length === 0) {
      return styleMap;
    }

    styles.forEach((style) => {
      const css = style.innerHTML;
      const rules = css.match(/[^{}]+{[^{}]+}/g);

      if (rules === null) {
        return;
      }

      rules.forEach((rule) => {
        const [selectors, properties] = rule.split('{');
        const selectorList = selectors
          .trim()
          .split(',')
          .map((s) => s.trim());
        const propsString = properties
          .trim()
          .slice(0, -1)
          .split(';')
          .map((prop) => {
            const [key, value] = prop.split(':').map((p) => p.trim());
            return key && value && !key.startsWith('mso-')
              ? `${key}: ${value}`
              : null;
          })
          .filter(Boolean)
          .join('; ');

        selectorList.forEach((selector) => {
          // Loop through the selectors
          // Clean the selector
          const cleanedSelector = selector
            .replace(/\/\*.*?\*\//g, '')
            .trim()
            .startsWith('.')
            ? selector.slice(1)
            : selector; // Remove the dot if it's a class
          const parts = cleanedSelector
            .split(/(?=[.#:])/)
            .map((part) => part.replace(/\/\*.*?\*\//g, '').trim());

          const tag = parts.shift() || 'tag'; // Default to 'tag' if there's no tag

          if (!styleMap[tag]) {
            // if tag doesn't exist in styleMap
            styleMap[tag] = new Map(); // Initialize Map for tag
            styleMap[tag].set('tag', ''); // Initialize tag property
          }
          const tagMap = styleMap[tag]; // Get the Map for the tag

          if (parts.length === 0) {
            // If there are no other selectors
            tagMap.set('tag', `${tagMap.get('tag')}${propsString}; `); // Add the styles to the tag property
          } else {
            const otherSelector = parts.join('').replace('.', ''); // Join the other selectors

            tagMap.set(otherSelector, `${propsString}; `); // Add the styles to the other selector
            // get the item just set and log it
          }
        });
      });
    });

   console.log(styleMap);

    return styleMap;
  };

  convertWordLists = (doc: Document) => {
    const paragraphs = Array.from(
      doc.querySelectorAll('p[class^="MsoListParagraph"]')
    );
    paragraphs.forEach((paragraph) => {
      const span = paragraph.querySelector('span');
      let listType = 'ul'; // Default to unordered list

      if (span) {
        // TODO: see if this is actually necessary or we can bang textContent.
        const text = span.textContent?.trim() ?? '';
        if (text.match(/^\d+\.\s*/)) {
          listType = 'ol'; // If the text starts with a number followed by a dot and spaces, it’s an ordered list
          span.remove(); // Remove the span containing the number and dot
        } else if (text === '·' || text === '•' || text === '◦') {
          span.remove(); // Remove the span containing the bullet point
        }
      }

      let list = paragraph.previousElementSibling;
      if (!list || list.tagName.toLowerCase() !== listType) {
        list = doc.createElement(listType);
        if (!paragraph.parentNode) {throw new Error('nothing works, TODO');}
        paragraph.parentNode.insertBefore(list, paragraph);
      }

      const listItem = doc.createElement('li');
      listItem.innerHTML = paragraph.innerHTML;
      list.appendChild(listItem);
      if (!paragraph.parentNode) {throw new Error('nothing works, TODO');}
      paragraph.parentNode.removeChild(paragraph);
    });
  };

  filterRtfImageToHtml = (html: string, rtf: any) => {
    const imgTags = this.extractTagsFromHtml(html);
    console.log('Extracted Image Tags: ', imgTags);
    if (imgTags.length === 0) return Promise.resolve(html);
    return rtf
      ? this.handleRtfImages(html, rtf, imgTags)
      : this.handleBlobImages(html, imgTags);
  };

  // Extract image URLs from HTML content.
  extractTagsFromHtml = (html: string) => {
    const regexp = /<img[^>]+src="([^"]+)[^>]+/g;
    const ret = [];
    let item;

    while ((item = regexp.exec(html))) {
      ret.push(item[1]);
    }

    return ret;
  };

  handleRtfImages = async (html: string, rtf: any, imgTags: any) => {
    const hexImages = this.extractFromRtf(rtf);
    console.log('Extracted Hex Images: ', hexImages);
    if (hexImages.length === 0) return html;

    const promises = this.config.imageHandler
        ? hexImages.map(img => this.imageHandlerWrapper(img))
        : hexImages.map(img => Promise.resolve(this.createSrcWithBase64(img)));

    const newSrcValues = await Promise.all(promises);
    console.log('New Src Values:', newSrcValues.length, newSrcValues);
    console.log('Image Tags:', imgTags.length, imgTags);

    imgTags.forEach((imgTag: string, index: string | number) => {
      if (imgTag.startsWith('file://')) {
        const newSrcValue = newSrcValues[index];
        if (newSrcValue) {
          const escapedPath = imgTag.replace(/\\/g, '\\\\');
          const imgRegex = new RegExp(
            `(<img [^>]*src=["\']?)${escapedPath}`,
            'g'
          );
         console.log(`Replacing ${escapedPath} with ${newSrcValue}`);
          html = html.replace(imgRegex, `$1${newSrcValue}`);
        } else {
          const imgTagRegex = new RegExp(
            `<img [^>]*src=["']${imgTag}["'][^>]*>`,
            'g'
          );
         console.log(`Removing <img> tag with src ${imgTag}`);
          html = html.replace(imgTagRegex, '');
        }
      }
    });

    return html;
  };

  // convert blob URLs to base64 images and replace them in the HTML content.
  handleBlobImages = (html: string, imgTags: any[]) => {
    const blobUrls = [...new Set(
        imgTags.filter(
            (imgTag: string) => /^blob:/i.test(imgTag) || /^file:/i.test(imgTag)
        )
    )];
    console.log("oh no, the wrong thing starts");
    const promises = blobUrls.map(this.convertBlobOrFileUrlToBase64.bind(this));

    return Promise.all(promises).then((dataUrls) => {
      dataUrls.forEach((dataUrl, i) => {
        if (!dataUrl) {
          console.error('Error converting blob or file to base64', {
            type: 'blobOrFile',
            index: i,
          });
          return;
        }
        const blob = blobUrls[i];
       console.log(`Replacing blob or file URL ${blob} with base64 data URL.`);
        html = html.replace(new RegExp(blob, 'g'), dataUrl);
      });
      return html;
    });
  };

  convertBlobOrFileUrlToBase64 = (url: string) =>
    new Promise((resolve, reject) => {
    console.log('convertBlobOrFileUrlToBase64', url);
      if (url.startsWith('file://')) {
        // convert local file URL to base64
        const filePath = url.replace('file:///', '');
        console.log("right now nothing can work anymore because it does not work!!!");
        fetch(`file://${filePath}`)
          .then((response) => {
            if (response.ok) {
              return response.blob();
            } else {
              throw new Error('Network response was not ok.');
            }
          })
          .then((blob) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve(reader.result);
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(blob);
          })
          .catch((error) => {
            console.error('Error fetching local file:', error);
            reject(error);
          });
      } else {
        // convert blob URL to base64
        console.log("very good, only blob")
        dataTools.load(
          url,
          (arrayBuffer: ArrayBuffer) => {
            const data = new Uint8Array(arrayBuffer);
            const imageType = imageTools.getImageTypeFromSignature(data);
            const img = { type: imageType, hex: data };

            if (this.config.imageHandler) {
              this.imageHandlerWrapper(img).then(resolve);
            } else {
              resolve(this.createSrcWithBase64(img));
            }
          },
          'arraybuffer'
        );
      }
    });

  extractFromRtf = (rtfContent: string) => {
    const ret: { id: any; hex: any; type: string; }[] = [];
    rtfContent = RTFTools.removeGroups(
      rtfContent,
      '(?:(?:header|footer)[lrf]?|nonshppict|shprslt)'
    );
    const wholeImages = RTFTools.getGroups(rtfContent, 'pict');

    if (!wholeImages) return ret;

    wholeImages.forEach((currentImage: { content: string | string[]; }) => {
      const imageId = this.getImageId(currentImage.content);
      const imageType = this.getImageType(currentImage.content);
      const imageDataIndex = this.getImageIndex(imageId, ret);
      const isAlreadyExtracted =
        imageDataIndex !== -1 && ret[imageDataIndex].hex;
      const isDuplicated =
        isAlreadyExtracted && ret[imageDataIndex].type === imageType;
      const isAlternateFormat =
        isAlreadyExtracted &&
        ret[imageDataIndex].type !== imageType &&
        imageDataIndex === ret.length - 1;
      const isWordArtShape = currentImage.content.includes('\\defshp');
      const isSupportedType = this.supportedImageTypes.includes(imageType);

      if (isDuplicated) {
        ret.push(ret[imageDataIndex]);
        return;
      }

      if (isAlternateFormat || isWordArtShape) return;

      const newImageData = {
        id: imageId,
        hex: isSupportedType
          ? this.getImageContent(currentImage.content)
          : null,
        type: imageType,
      };

      if (imageDataIndex !== -1) {
        ret.splice(imageDataIndex, 1, newImageData);
      } else {
        ret.push(newImageData);
      }
    });

    return ret;
  };

  getImageIndex = (id: any, ret: any[]) => 
    typeof id !== 'string' 
      ? -1 
      : ret.findIndex((image: { id: string; }) => image.id === id);


  getImageId = (image: string) => {
    const blipUidRegex = /\\blipuid (\w+)\}/;
    const blipTagRegex = /\\bliptag(-?\d+)/;
    const blipUidMatch = image.match(blipUidRegex);
    const blipTagMatch = image.match(blipTagRegex);
    return blipUidMatch
      ? blipUidMatch[1]
      : blipTagMatch
      ? blipTagMatch[1]
      : null;
  };

  getImageContent = (image: any) =>
    tools.extractGroupContent(image).replace(/\s/g, '');

  getImageType = (imageContent: string) => {
    const tests = [
      { marker: /\\pngblip/, type: 'image/png' },
      { marker: /\\jpegblip/, type: 'image/jpeg' },
      { marker: /\\emfblip/, type: 'image/emf' },
      { marker: /\\wmetafile\d/, type: 'image/wmf' },
    ];
    const extractedType = tests.find(test => test.marker.test(imageContent));
    return extractedType ? extractedType.type : 'unknown';
  };

  createSrcWithBase64 = (img: { type: any; hex: any; }) => {
    if (!this.supportedImageTypes.includes(img.type)) return null;
    const data =
      typeof img.hex === 'string'
        ? ImageTools.convertHexStringToBytes(img.hex)
        : img.hex;
    const base64Data = ImageTools.convertBytesToBase64(data);
   console.log(`Converted Image: data:${img.type};base64,${base64Data}`);
    return img.type ? `data:${img.type};base64,${base64Data}` : null;
  };

  // Create a Blob object from image data.
  createBlobWithImageInfo = (img: { type: string; hex: any; }) => {
    console.log('createBlobWithImageInfo');
    console.log(this.supportedImageTypes, img.type);

    console.log('supported?', this.supportedImageTypes.includes(img.type));

    if (!this.supportedImageTypes.includes(img.type)) return null;

    const data =
      typeof img.hex === 'string'
        ? imageTools.convertHexStringToBytes(img.hex)
        : img.hex;

    const ab = new ArrayBuffer(data.length);
    const ia = new Uint8Array(ab);
    ia.set(data);
    return new Blob([ia], { type: img.type });
  };

  // Wrapper for custom image handler.
  imageHandlerWrapper = (img: { type: any/*TODO*/; hex: Uint8Array<ArrayBuffer>; }) =>
    new Promise((resolve) => {
     console.log('imageHandlerWrapper', img);
      this.config.imageHandler(this.createBlobWithImageInfo(img), resolve);
    });

  // Process a single file pasted from the clipboard.
  handleSingleFile = (file: Blob) =>
    new Promise((resolve) => {
    console.log('Handling single file: ', file);
      const supportType = this.supportedImageTypes.includes(file.type);
      if (this.config.imageHandler) {
        const blob = new Blob([file], { type: file.type });
        this.config.imageHandler(blob, (result: unknown) => {
          resolve(supportType ? `<img src="${result}" />` : result);
        });
      } else {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          resolve(
            supportType
              ? `<img src="${fileReader.result}" />`
              : fileReader.result
          );
        };
        fileReader.onerror = (err) => console.error(err);
        fileReader.readAsDataURL(file);
      }
    });
}

export default PasteFromWord;
