
import { Situs } from './Situs';

export interface Response {
  readonly selection: (Situs) | null;
  readonly kill: boolean;
}

const create = (selection: (Situs) | null, kill: boolean): Response => ({
  selection,
  kill
});

export const Response = {
  create
};
