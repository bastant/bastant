import { expect } from "chai";

import { deepExtend } from "./deep-extend.js";

describe("deepExtend(null, null)", () => {
  it("should return null", () => {
    const a = null;
    const b = null;
    expect(deepExtend(a, b)).to.be.null;
  });
});

describe("deepExtend(undefined, undefined)", () => {
  it("should return undefined", () => {
    const a = undefined;
    const b = undefined;
    expect(deepExtend(a, b)).to.be.undefined;
  });
});

// Objects

describe("deepExtend(null, object)", () => {
  it("should return an object", () => {
    const a = null;
    const b = { a: 1 };
    expect(deepExtend(a, b)).to.equal(b);
  });
});

describe("deepExtend(undefined, object)", () => {
  it("should return an object", () => {
    const a = undefined;
    const b = { a: 1 };
    expect(deepExtend(a, b)).to.equal(b);
  });
});

describe("deepExtend(object, null)", () => {
  it("should return an object", () => {
    const a = { a: 1 };
    const b = null;
    expect(deepExtend(a, b)).to.equal(a);
  });
});

describe("deepExtend(object, undefined)", () => {
  it("should return an object", () => {
    const a = { a: 1 };
    const b = undefined;
    expect(deepExtend(a, b)).to.equal(a);
  });
});

describe("deepExtend(object, object)", () => {
  it("should replace existing attributes", () => {
    const a = { a: 1 };
    const b = { a: 2 };
    expect(deepExtend(a, b)).to.equal(b);
  });

  it("should merge new attributes", () => {
    const a = { a: 1 };
    const b = { b: 2 };
    const r = { a: 1, b: 2 };
    expect(deepExtend(a, b)).to.equal(r);
  });

  it("should merge objects recursively", () => {
    const a = { a: { b: 1, c: 3 }, d: 4 };
    const b = { a: { b: 2 } };
    const r = { a: { b: 2, c: 3 }, d: 4 };
    expect(deepExtend(a, b)).to.equal(r);
  });

  it("should not modify input array", () => {
    const a = { array: null };
    const b = { array: [1, 2, 3] };
    expect(deepExtend(a, b).array).not.to.be(b.array as any);
  });
});

// Arrays

describe("deepExtend(array, array)", () => {
  it("should merge arrays by replacing index value", () => {
    const a = [0, 1];
    const b = [0, 2];
    expect(deepExtend(a, b)).to.equal(b);
  });

  it("should not ignore null values when merging arrays", () => {
    const a = [0, 1];
    const b = [0, null];
    const r = [0, null];
    expect(deepExtend(a, b)).to.equal(r);
  });

  it("should ignore undefined values when merging arrays", () => {
    const a = [0, 1];
    const b = [0, undefined];
    const r = [0, 1];
    expect(deepExtend(a, b)).to.equal(r);
  });

  it("should merge arrays recursively", () => {
    const a = [1, [2, [3]]];
    const b = [undefined, [4, [undefined, 5], 6], 7];
    const r = [1, [4, [3, 5], 6], 7];
    expect(deepExtend(a, b)).to.equal(r);
  });
});

describe("deepExtend(null, array)", () => {
  it("should not modify input array", () => {
    const a = null;
    const b = [1, 2, 3];
    expect(deepExtend(a, b)).not.to.be(b as any);
  });
});

// Arrays to Object

describe("deepExtend(object, array)", () => {
  it("should merge arrays into objects", () => {
    const a = {};
    const b = [1];
    const r = { 0: 1 };
    expect(deepExtend(a, b)).to.equal(r);
  });
});

describe('deepExtend({}, { __proto__: { polluted: "polluted" } })', () => {
  it("should not pollute prototype", () => {
    const a = {};
    const b = JSON.parse('{"__proto__": {"polluted": "polluted"}}');
    const result = deepExtend(a, b);
    expect(result).to.equal({});
    // @ts-ignore
    expect({}.polluted).toBeUndefined();
  });
});
