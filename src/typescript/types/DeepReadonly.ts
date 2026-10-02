/**
 * Defines DeepReadonly, a generic type that makes every field of a type read-only, all the way down.
 */

/**
 * Makes every field of T read-only, including fields of nested objects and the contents of arrays.
 * Used to give the UI a version of the game state it cannot change (checked by TypeScript, not at runtime).
 */
export type DeepReadonly<T> = T extends (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;
