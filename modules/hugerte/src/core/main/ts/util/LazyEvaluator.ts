
const evaluateUntil = <T extends any[], R>(fns: Array<(...args: T) => (R) | null>, args: T): (R) | null => {
  for (let i = 0; i < fns.length; i++) {
    const result = fns[i].apply(null, args);
    if (result !== null) {
      return result;
    }
  }

  return null;
};

export {
  evaluateUntil
};
