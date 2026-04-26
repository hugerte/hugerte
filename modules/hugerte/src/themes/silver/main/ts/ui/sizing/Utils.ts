
const parseToInt = (val: string | number): (number) | null => {
  // if size is a number or '_px', will return the number
  const re = /^[0-9\.]+(|px)$/i;
  if (re.test('' + val)) {
    return parseInt('' + val, 10);
  }
  return null;
};

const numToPx = (val: string | number): string => typeof (val) === 'number' ? val + 'px' : val;

const calcCappedSize = (size: number, minSize: (number) | null, maxSize: (number) | null): number => {
  const minOverride = minSize.filter((min) => size < min);
  const maxOverride = maxSize.filter((max) => size > max);
  return minOverride.or(maxOverride) ?? (size);
};

export {
  calcCappedSize,
  parseToInt,
  numToPx
};
