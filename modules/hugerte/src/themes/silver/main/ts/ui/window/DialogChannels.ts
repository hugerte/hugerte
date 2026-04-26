
const dialogChannel = (('update-dialog') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const titleChannel = (('update-title') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const bodyChannel = (('update-body') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const footerChannel = (('update-footer') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const bodySendMessageChannel = (('body-send-message') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const dialogFocusShiftedChannel = (('dialog-focus-shifted') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

export {
  dialogChannel,
  titleChannel,
  bodyChannel,
  bodySendMessageChannel,
  footerChannel,
  dialogFocusShiftedChannel
};
