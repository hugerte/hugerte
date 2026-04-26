
import * as Structs from '../api/Structs';

export const uniqueColumns = (details: Structs.DetailExt[]): Structs.DetailExt[] => {
  const uniqueCheck = (rest: Structs.DetailExt[], detail: Structs.DetailExt) => {
    const columnExists = (rest).some((currentDetail) => currentDetail.column === detail.column);

    return columnExists ? rest : rest.concat([ detail ]);
  };

  return (details).reduce(uniqueCheck, []).sort((detailA, detailB) =>
    detailA.column - detailB.column
  );
};
