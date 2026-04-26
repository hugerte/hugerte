
import { Size } from './Size';

// Convert all column widths to percent.
const redistributeToPercent = (widths: string[], totalWidth: number): string[] => {
  return (widths).map((w) => {
    const colType = Size.from(w);
    return colType.fold(() => {
      return w;
    }, (px) => {
      const ratio = px / totalWidth * 100;
      return ratio + '%';
    }, (pc) => {
      return pc + '%';
    });
  });
};

const redistributeToPx = (widths: string[], totalWidth: number, newTotalWidth: number): string[] => {
  const scale = newTotalWidth / totalWidth;
  return (widths).map((w) => {
    const colType = Size.from(w);
    return colType.fold(() => {
      return w;
    }, (px) => {
      return (px * scale) + 'px';
    }, (pc) => {
      return (pc / 100 * newTotalWidth) + 'px';
    });
  });
};

const redistributeEmpty = (newWidthType: Size, columns: number): string[] => {
  const f = newWidthType.fold(
    () =>
      () => '',
    (pixels) => { // Pixels
      const num = pixels / columns;
      return () => num + 'px';
    },
    () => { // Percentages.
      const num = 100 / columns;
      return () => num + '%';
    }
  );
  return Array.from({length: columns}, (_, _i) => (f)(_i));
};

const redistributeValues = (newWidthType: Size, widths: string[], totalWidth: number): string[] => {
  return newWidthType.fold(() => {
    return widths;
  }, (px) => {
    return redistributeToPx(widths, totalWidth, px);
  }, (_pc) => {
    return redistributeToPercent(widths, totalWidth);
  });
};

const redistribute = (widths: string[], totalWidth: number, newWidth: string): string[] => {
  const newType = Size.from(newWidth);
  const floats = (widths).every((s) => {
    return s === '0px';
  }) ? redistributeEmpty(newType, widths.length) : redistributeValues(newType, widths, totalWidth);
  return normalize(floats);
};

const sum = (values: string[], fallback: number): number => {
  if (values.length === 0) {
    return fallback;
  }
  return (values).reduceRight((rest, v) => {
    return Size.from(v).fold(() => 0, (x: any) => x, (x: any) => x) + rest;
  }, 0);
};

const roundDown = (num: number, unit: string): { value: string; remainder: number } => {
  const floored = Math.floor(num);
  return { value: floored + unit, remainder: num - floored };
};

const add = (value: string, amount: number): string => {
  return Size.from(value).fold(() => value, (px) => {
    return (px + amount) + 'px';
  }, (pc) => {
    return (pc + amount) + '%';
  });
};

const normalize = (values: string[]): string[] => {
  if (values.length === 0) {
    return values;
  }
  const scan = (values).reduceRight((rest, value) => {
    const info = Size.from(value).fold(
      () => ({ value, remainder: 0 }),
      (num) => roundDown(num, 'px'),
      (num) => ({ value: num + '%', remainder: 0 })
    );

    return {
      output: [ info.value ].concat(rest.output),
      remainder: rest.remainder + info.remainder
    };
  }, { output: [] as string[], remainder: 0 });

  const r = scan.output;
  return r.slice(0, r.length - 1).concat([ add(r[r.length - 1], Math.round(scan.remainder)) ]);
};

const validate = Size.from;

export { validate, redistribute, sum, normalize };

