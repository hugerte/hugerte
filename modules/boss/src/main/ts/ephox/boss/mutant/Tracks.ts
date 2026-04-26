
import { Gene } from '../api/Gene';

const track = (current: Gene, parent: (Gene) | null): Gene => {
  const r: Gene = { ...current, parent };

  r.children = (current.children || []).map((child) => {
    // NOTE: The child must link to the new one being created (r)
    return track(child, r);
  });

  return r;
};

export {
  track
};
