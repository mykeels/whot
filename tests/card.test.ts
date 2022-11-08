import { assert } from "chai";
import { Card } from "../src/card";

import Shapes from "../src/shapes";

describe("Card", () => {
  it("should have a score", () => {
    const circle = Card.createCircleCard({
      value: 1,
    });
    assert.equal(circle.score, 1);
  });

  describe("Star", () => {
    it("should have a double score", () => {
      const star = Card.createStarCard({
        value: 1,
      });
      assert.equal(star.score, 2);
    });
  });

  describe(".matches()", () => {
    it("should be false if cards have different shapes", () => {
      assert.isFalse(
        Card.createSquareCard({ value: 1 }).matches(
          Card.createCircleCard({ value: 8 })
        )
      );
    });

    it("should be true if cards have different shapes but same value", () => {
      assert.isTrue(
        Card.createSquareCard({ value: 1 }).matches(
          Card.createCircleCard({ value: 1 })
        )
      );
    });

    it("should be true if cards have same shape but different values", () => {
      assert.isTrue(
        Card.createCircleCard({ value: 1 }).matches(
          Card.createCircleCard({ value: 8 })
        )
      );
    });

    it("should be true if cards have same shape and same values", () => {
      assert.isTrue(
        Card.createCircleCard({ value: 1 }).matches(
          Card.createCircleCard({ value: 1 })
        )
      );
    });

    it("should be true if either card is whot", () => {
      assert.isTrue(
        Card.createCircleCard({ value: 1 }).matches(
          Card.createWhotCard({ iNeed: Shapes.Circle, value: 20 })
        )
      );
      assert.isTrue(
        Card.createWhotCard({ iNeed: Shapes.Square, value: 20 }).matches(
          Card.createSquareCard({ value: 2 })
        )
      );
    });

    it("should NOT match because whot card has no value", () => {
      assert.isFalse(
        Card.createWhotCard({ value: 20 }).matches(
          Card.createSquareCard({ value: 13 })
        )
      );
    });

    it("should match because whot card needs a Square", () => {
      assert.isTrue(
        Card.createWhotCard({ iNeed: Shapes.Square, value: 20 }).matches(
          Card.createSquareCard({ value: 13 })
        )
      );
    });
  });
});
