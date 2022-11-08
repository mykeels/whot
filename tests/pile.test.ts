import { assert } from "chai";
import { Card } from "../src/card";
import emitter from "../src/events";
import Pile from "../src/pile";

describe("Pile", () => {
  describe(".top()", () => {
    it("should be null initially", () => {
      const pile = new Pile({ emitter });
      assert.isNull(pile.top());
    });
  });

  describe(".push([...])", () => {
    it("should throw InvalidArgumentTypeError(Array)", () => {
      try {
        const pile = new Pile({ emitter });
        // @ts-ignore
        pile.push({});
        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "InvalidArgumentTypeError");
        assert.equal(err.type.name, "Array");
      }
    });

    it("should throw NoCardSuppliedError when _cards_[] is empty", () => {
      try {
        const pile = new Pile({ emitter });
        pile.push([]);
        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "NoCardSuppliedError");
      }
    });

    it("should throw LastCardMismatchError", () => {
      try {
        const pile = new Pile({ emitter });
        const card = Card.createCircleCard({ value: 1 });
        const card2 = Card.createSquareCard({ value: 2 });
        pile.push([card]);
        pile.push([card2]);
        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "LastCardMismatchError");
      }
    });

    it("should work", () => {
      const pile = new Pile({ emitter });
      const card = Card.createCircleCard({ value: 1 });
      pile.push([card]);
      assert.deepEqual(pile.top(), card);
    });
  });
});
