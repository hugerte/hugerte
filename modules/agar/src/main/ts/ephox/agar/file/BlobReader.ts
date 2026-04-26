

export const readBlobAsString = (blob: Blob): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new window.FileReader();

    reader.addEventListener('loadend', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read blob as string'));
      }
    });

    reader.readAsText(blob);
  });
};

