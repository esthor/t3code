import { describe, expect, it } from "vite-plus/test";

import { copySorted } from "./Array.ts";

describe("array copies", () => {
  it("sorts a copy without mutating the source", () => {
    const source = [3, 1, 2];

    expect(copySorted(source, (left: number, right: number) => left - right)).toEqual([1, 2, 3]);
    expect(source).toEqual([3, 1, 2]);
  });

  it("keeps equal elements in their original order", () => {
    const source = [
      { id: "a", rank: 1 },
      { id: "b", rank: 0 },
      { id: "c", rank: 1 },
    ];

    expect(copySorted(source, (left, right) => left.rank - right.rank).map(({ id }) => id)).toEqual(
      ["b", "a", "c"],
    );
  });
});
