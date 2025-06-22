
// https://stackoverflow.com/questions/14446511/most-efficient-method-to-groupby-on-an-array-of-objects
export function groupBy<T>(xs: T[], key: keyof T): { [key: string]: T[]; } {
  return xs.reduce(function (rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

export function groupByFunc<T, V>(xs: T[], keyFunc: (row: T) => string, valueFunc: (row: T) => V): { [key: string]: V[]; } {
  return xs.reduce((prev: any, next: T) => {
    const currKey = keyFunc(next);
    (prev[currKey] = prev[currKey] || []).push(valueFunc(next));
    return prev;
  }, {});
}

export function toWindows<T>(inputArray: T[], size: number): T[][] {
  return inputArray
    .reduce((acc: T[][], _, index, arr) => {
      if (index + size > arr.length) {
        //we've reached the maximum number of windows, so don't add any more
        return acc;
      }

      //add a new window of [currentItem, maxWindowSizeItem)
      return acc.concat(
        //wrap in extra array, otherwise .concat flattens it
        [arr.slice(index, index + size)]
      );

    }, new Array<Array<T>>)
}

// https://dev.to/mebble/learn-to-fold-your-js-arrays-2o8p
export function fold<T, TOutput>(reducer: (x: TOutput, y: T) => TOutput, init: TOutput, xs: T[]): TOutput {
  let acc = init;
  for (const x of xs) {
    acc = reducer(acc, x);
  }
  return acc;
};

export function distinct<T, U>(xs: T[], propertySelector: (x: T) => U): T[] {
  return xs
    .filter((value, index, array) => array.findIndex(y => propertySelector(y) === propertySelector(value)) === index);
}

// https://stackoverflow.com/questions/33679850/how-to-do-equivalent-of-linq-selectmany-just-in-javascript
export function flatten<T>(xs: T[][]): T[] {
  return xs.length === 0 ? [] : xs.reduce((a, b) => a.concat(b));
}