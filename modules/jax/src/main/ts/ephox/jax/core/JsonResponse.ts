import { Result } from '@ephox/katamari';

export const create = (text: string): Result<any, string> => {
  try {
    const parsed = JSON.parse(text);
    return Result.value(parsed);
  } catch (_error) {
    return Result.error('Response was not JSON.');
  }
};