export type Result<T, E> = [err: E, data: null] | [err: null, data: T];
