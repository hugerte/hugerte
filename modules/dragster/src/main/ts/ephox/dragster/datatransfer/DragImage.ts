
export interface DragImageData {
  readonly image: Element;
  readonly x: number;
  readonly y: number;
}

const imageId = (('image') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

const getDragImage = (transfer: DataTransfer): (DragImageData) | null => {
  const dt: Record<string, any> = transfer;
  return (dt[imageId] ?? null);
};

const setDragImage = (transfer: DataTransfer, imageData: DragImageData): void => {
  const dt: Record<string, any> = transfer;
  dt[imageId] = imageData;
};

export {
  getDragImage,
  setDragImage
};
