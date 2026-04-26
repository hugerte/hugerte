
export interface BeforeAfter {
  readonly before: (number) | null;
  readonly after: (number) | null;
}

export const BeforeAfter = (before: (number) | null, after: (number) | null): BeforeAfter => ({
  before,
  after
});
