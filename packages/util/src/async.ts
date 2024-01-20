export function wait(ms: number = 0) {
  return new Promise((res) => setTimeout(res, ms));
}

export function waitAtLeast<T>(
  promise: PromiseLike<T>,
  ms: number
): Promise<T> {
  return new Promise((res, rej) => {
    let result: T | undefined;
    let done = false;
    let timer: any = setTimeout(() => {
      timer = null;
      if (done) {
        res(result!);
      }
    }, ms);

    promise.then(
      (resp) => {
        if (timer) {
          result = resp;
          done = true;
        } else {
          res(resp);
        }
      },
      (e) => {
        done = true;
        if (timer) {
          clearTimeout(timer);
        }

        rej(e);
      }
    );
  });
}
