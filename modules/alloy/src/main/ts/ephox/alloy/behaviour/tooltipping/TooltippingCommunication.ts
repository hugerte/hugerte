
const ExclusivityChannel = (('tooltip.exclusive') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

const ShowTooltipEvent = (('tooltip.show') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const HideTooltipEvent = (('tooltip.hide') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const ImmediateHideTooltipEvent = (('tooltip.immediateHide') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const ImmediateShowTooltipEvent = (('tooltip.immediateShow') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

export {
  ExclusivityChannel,
  ShowTooltipEvent,
  HideTooltipEvent,
  ImmediateShowTooltipEvent,
  ImmediateHideTooltipEvent
};
