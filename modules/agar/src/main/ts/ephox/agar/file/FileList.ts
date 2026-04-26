

const createFileList = (inputFiles: File[]): FileList => {
  const files: FileList = {
    length: inputFiles.length,
    item: (idx: number) => inputFiles[idx]
  };

  inputFiles.forEach((file, idx) =) {
    files[idx] = file;
  });

  return Object.freeze(files) as unknown as FileList;
};

export {
  createFileList
};
