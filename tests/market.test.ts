import { assert } from "chai";
import emitter from "../src/events";
import Pile from "../src/pile";
import Market from "../src/market";

describe("Market", () => {
  describe("Constructor", () => {
    it("should have cards length = noOfDecks * 54", () => {
      const market = new Market({
        noOfDecks: 1,
        emitter,
        pile: () => new Pile({ emitter }),
      });
      assert.equal(market.count(), 54);

      const market2 = new Market({
        noOfDecks: 2,
        emitter,
        pile: () => new Pile({ emitter }),
      });
      assert.equal(market2.count(), 108);
    });
  });

  describe("Pick(n)", () => {
    it("should remove (n) cards from the market", () => {
      const market = new Market({
        noOfDecks: 1,
        emitter,
        pile: () => new Pile({ emitter }),
      });
      const pickedCards = market.pick(2);
      assert.equal(pickedCards.length, 2);
      assert.equal(market.count(), 52);
    });

    it("should throw PropNotFoundError because pile() not provided", () => {
      try {
        // @ts-ignore
        const market = new Market({ noOfDecks: 1, emitter, pile: null });
        market.pick(55);
        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "PropNotFoundError");
      }
    });

    it("should throw OutOfRangeError if (n) >= .count*()", () => {
      try {
        const pile = () => new Pile({ emitter });
        const market = new Market({ noOfDecks: 1, emitter, pile });
        const pickedCards = market.pick(55);
        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "OutOfRangeError");
      }
    });
  });
});
