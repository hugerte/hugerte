
const is = (expected: string) => (actual: string): boolean =>
  expected === actual;

const isNbsp = is('\u00A0');

const isWhiteSpace = (chr: string): boolean =>
  chr !== '' && ' \f\n\r\t\v'.indexOf(chr) !== -1;

const isContent = (chr: string): boolean =>
  !isWhiteSpace(chr) && !isNbsp(chr) && !(chr) === '\uFEFF';

export {
  isNbsp,
  isWhiteSpace,
  isContent
};
