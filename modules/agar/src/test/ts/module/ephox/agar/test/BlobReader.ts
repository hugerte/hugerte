const readBlobAsText = (blob: Blob): Promise<string> => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsText(blob);
  reader.onloadend = () => {
    resolve(reader.result as string);
  };
  reader.onerror = () => {
    reject(new Error('Error loading blob'));
  };
});

export {
  readBlobAsText
};

