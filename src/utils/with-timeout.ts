interface Options {
  /** in milliseconds */
  timeout: number;
}
export function withTimeout<T>(thunk: () => Promise<T>, opt: Options): Promise<T> {
  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), opt.timeout);

  return thunk().then((res) => {
    clearTimeout(timeout);
    return res;
  });
}
