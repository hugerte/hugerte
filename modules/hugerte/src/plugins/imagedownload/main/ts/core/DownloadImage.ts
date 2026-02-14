import Editor from 'hugerte/core/api/Editor';
import { Arr, Fun, Optional, Type } from '@ephox/katamari';
import ImageUploader, { UploadResult } from 'hugerte/core/api/util/ImageUploader';
import { BlobInfo } from 'hugerte/core/api/file/BlobCache';
import * as Conversions from 'hugerte/core/main/ts/file/Conversions';

const isExternalUrl = (url: string): boolean => {
  if (!url || url === '') {
    return false;
  }
  return /^(?:[a-zA-Z]+:)?\/\//.test(url) && !url.startsWith('data:') && !url.startsWith('blob:');
};

const getImageFilename = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    if (filename && filename.includes('.')) {
      return filename;
    }
  } catch (e) {
    // Fall through
  }
  return 'image.png';
};

const fetchImage = async (url: string): Promise<Blob> => {
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.blob();
};

const downloadAndReplaceImage = async (editor: Editor, img: HTMLImageElement): Promise<void> => {
  const src = img.src;
  
  if (!isExternalUrl(src)) {
    return Promise.resolve();
  }

  try {
    const blob = await fetchImage(src);
    
    // Convert blob to data URI
    const dataUri = await Conversions.blobToDataUri(blob);
    
    // Get filename from URL or default
    const filename = getImageFilename(src);
    const name = filename.replace(/\.[^.]+$/, '');
    
    // Create blob info
    const blobCache = editor.editorUpload.blobCache;
    const blobInfo = blobCache.create({
      blob,
      blobUri: URL.createObjectURL(blob),
      name,
      filename,
      base64: dataUri.split(',')[1]
    });
    
    blobCache.add(blobInfo);
    
    // Check if automatic uploads are enabled
    const automaticUploads = editor.options.get('automatic_uploads');
    
    if (automaticUploads) {
      // Upload the image
      const results = await ImageUploader(editor).upload([blobInfo], false);
      
      if (results.length === 0) {
        throw new Error('Failed to upload image');
      }
      
      const result = results[0];
      
      if (result.status === false) {
        throw new Error(result.error?.message || 'Upload failed');
      }
      
      // Update image src with uploaded URL
      img.src = result.url;
    } else {
      // Use blob URI
      img.src = blobInfo.blobUri();
    }
    
    // Trigger upload auto to ensure any pending uploads are processed
    editor.editorUpload.uploadImagesAuto();
    
  } catch (err) {
    console.error('Failed to download image:', err);
    throw err;
  }
};

const downloadImagesInSelection = async (editor: Editor): Promise<number> => {
  const selectedNode = editor.selection.getNode();
  const images: HTMLImageElement[] = [];
  
  if (selectedNode.nodeName === 'IMG') {
    images.push(selectedNode as HTMLImageElement);
  } else {
    // Get all images in the selection or current context
    const imgs = editor.dom.select('img', selectedNode);
    Arr.each(imgs, (img) => {
      if (isExternalUrl(img.src)) {
        images.push(img);
      }
    });
  }
  
  // Also check if the selection contains any images
  if (images.length === 0) {
    const rng = editor.selection.getRng();
    const fragment = rng.cloneContents();
    const tempDiv = editor.dom.create('div');
    tempDiv.appendChild(fragment);
    const selectedImgs = editor.dom.select('img', tempDiv);
    Arr.each(selectedImgs, (img) => {
      if (isExternalUrl(img.src)) {
        images.push(img);
      }
    });
  }
  
  let processedCount = 0;
  
  // Process each image
  for (const img of images) {
    try {
      await downloadAndReplaceImage(editor, img);
      processedCount++;
    } catch (err) {
      // Continue with other images even if one fails
      console.error(`Failed to process image ${img.src}:`, err);
    }
  }
  
  return processedCount;
};

const downloadAllExternalImages = async (editor: Editor): Promise<number> => {
  const images = editor.dom.select('img');
  const externalImages = Arr.filter(images, (img) => isExternalUrl(img.src));
  
  let processedCount = 0;
  
  for (const img of externalImages) {
    try {
      await downloadAndReplaceImage(editor, img);
      processedCount++;
    } catch (err) {
      console.error(`Failed to process image ${img.src}:`, err);
    }
  }
  
  return processedCount;
};

export {
  isExternalUrl,
  getImageFilename,
  fetchImage,
  downloadAndReplaceImage,
  downloadImagesInSelection,
  downloadAllExternalImages
};
