import { renderShape } from "../src/shapes";
import Shapes from "../src/shapes";
import { assert } from "chai";

describe("Shapes", () => {
  describe("Render", () => {
    it("should return c", () => {
      assert.equal(renderShape(Shapes.Circle), "c");
    });

    it("should return +", () => {
      assert.equal(renderShape(Shapes.Cross), "+");
    });

    it("should return s", () => {
      assert.equal(renderShape(Shapes.Square), "s");
    });

    it("should return *", () => {
      assert.equal(renderShape(Shapes.Star), "*");
    });

    it("should return w", () => {
      assert.equal(renderShape(Shapes.Whot), "w");
    });

    it("should return t", () => {
      assert.equal(renderShape(Shapes.Triangle), "t");
    });

    it("should return same", () => {
      // @ts-ignore
      assert.equal(renderShape("same"), "same");
    });
  });
});
