export type deepPick<T, K extends string | number | symbol> = {
  [P in keyof T]: T[P] extends Record<any, any>
    ? deepPick<T[P], K>
    : P extends K
    ? T[P]
    : never;
};
export type In<
  T extends Record<string | number | symbol, any>,
  K extends string | number | symbol,
> = K extends keyof T ? true : never;
