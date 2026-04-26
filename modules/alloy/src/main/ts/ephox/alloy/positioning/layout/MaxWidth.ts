import { SugarElement, Width } from '@ephox/sugar';

// applies the max-width as determined by Bounder
const expandable = () => (element: SugarElement<HTMLElement>, available: number): void => {
  Width.setMax(element, Math.floor(available));
};

export { expandable };
