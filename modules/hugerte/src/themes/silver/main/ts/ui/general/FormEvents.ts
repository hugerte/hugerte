import { CustomEvent } from '@ephox/alloy';

export interface FormChangeEvent<T> extends CustomEvent {
  readonly name: keyof T;
}

// tslint:disable-next-line:no-empty-interface
export interface FormCloseEvent extends CustomEvent {

}

// tslint:disable-next-line:no-empty-interface
export interface FormCancelEvent extends CustomEvent {

}

export interface FormActionEvent extends CustomEvent {
  readonly name: string;
  readonly value: any;
}

// tslint:disable-next-line:no-empty-interface
export interface FormSubmitEvent extends CustomEvent {

}

// tslint:disable-next-line:no-empty-interface
export interface FormBlockEvent extends CustomEvent {
  readonly message: string;
}

// tslint:disable-next-line:no-empty-interface
export interface FormUnblockEvent extends CustomEvent {

}

export interface FormTabChangeEvent extends CustomEvent {
  readonly name: string;
  readonly oldName: string;
}

const formChangeEvent = (('form-component-change') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formCloseEvent = (('form-close') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formCancelEvent = (('form-cancel') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formActionEvent = (('form-action') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formSubmitEvent = (('form-submit') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formBlockEvent = (('form-block') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formUnblockEvent = (('form-unblock') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formTabChangeEvent = (('form-tabchange') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
const formResizeEvent = (('form-resize') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

export {
  formChangeEvent,
  formActionEvent,
  formSubmitEvent,
  formCloseEvent,
  formCancelEvent,
  formBlockEvent,
  formUnblockEvent,
  formTabChangeEvent,
  formResizeEvent
};
