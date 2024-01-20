/**
 * Merges two arrays and returns the new one.
 * @param a
 * @param b
 * @param fn
 */
function mergeArrays<A, B>(
  a: A[],
  b: B[],
  fn: (...args: any[]) => any
): Array<A | B> {
  const result = [];

  for (let i = 0; i < a.length; i += 1) {
    if (typeof a !== "undefined") {
      if (a[i] !== null && typeof a[i] === "object") {
        result[i] = fn({}, a[i]);
      } else {
        result[i] = a[i];
      }
    }
  }

  for (let i = 0; i < b.length; i += 1) {
    if (typeof b[i] !== "undefined") {
      if (b[i] !== null && typeof b[i] === "object") {
        result[i] = fn(a[i], b[i]);
      } else {
        result[i] = b[i];
      }
    }
  }
  return result;
}

/**
 * Merge deep objects
 * @param args
 */
function deepExtend(...args: any[]): any {
  let a = args.shift();

  for (let i = 0; i < args.length; i += 1) {
    const b = args[i];

    if (
      a !== null &&
      b !== null &&
      typeof a !== "undefined" &&
      typeof b !== "undefined"
    ) {
      // Merge objects
      if (typeof a === "object" && typeof b === "object") {
        // Merge arrays
        if (Array.isArray(a) && Array.isArray(b)) {
          a = mergeArrays(a, b, deepExtend);
        } else {
          const keys: string[] = Object.keys(b);

          for (let j = 0; j < keys.length; j += 1) {
            const key: string = keys[j];

            // Avoid prototype pollution.
            if (key !== "__proto__") {
              if (typeof b[key] === "object" && b[key] !== null) {
                a[key] = deepExtend(a[key], b[key]);
              } else if (typeof b[key] !== "undefined") {
                a[key] = b[key];
              }
            }
          }
        }
      }
    } else if (b !== null && typeof b !== "undefined") {
      if (Array.isArray(b)) {
        a = mergeArrays([], b, deepExtend);
      } else {
        a = b;
      }
    }
  }
  return a;
}

export default deepExtend;
