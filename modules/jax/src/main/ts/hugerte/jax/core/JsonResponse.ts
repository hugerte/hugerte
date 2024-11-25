import { Result } from "@hugerte/katamari";

export const create = (text: string): Result<any, string> => {
  try {
    const parsed = JSON.parse(text);
    return Result.value(parsed);
  } catch (error) {
    return Result.error('Response was not JSON.');
  }
};