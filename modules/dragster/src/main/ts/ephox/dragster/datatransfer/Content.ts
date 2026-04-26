
const getHtmlData = (dataTransfer: DataTransfer): (string) | null => {
  const html = dataTransfer.getData('text/html');
  return html === '' ? null : html;
};

const setHtmlData = (dataTransfer: DataTransfer, html: string): void =>
  dataTransfer.setData('text/html', html);

export {
  getHtmlData,
  setHtmlData
};
