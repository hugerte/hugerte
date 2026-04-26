
export const getAllObjects = (obj: any): Array<Object> => {
  if ((typeof (obj) === 'object' && (obj) !== null)) {
    return [ obj ].concat((Object.values(obj)).flatMap(getAllObjects));
  } else if (Array.isArray(obj)) {
    return (obj).flatMap(getAllObjects);
  } else {
    return [];
  }
};
