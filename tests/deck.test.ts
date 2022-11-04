import { assert } from "chai";
import Deck from "../src/deck";
import Card from "../src/card";
import { EventEmitter } from "../src/events";

const MAX_NO_OF_CARDS = 54;

describe("Deck", () => {
  const deck = new Deck({
    emitter: new EventEmitter()
  });

  it("should have cards array", () => {
    assert.isArray(deck.cards);
  });

  describe("Deck.prototype.cards", () => {
    describe("length", () => {
      it(`should be ${MAX_NO_OF_CARDS}`, () => {
        assert.equal(deck.cards.length, MAX_NO_OF_CARDS);
      });
    });

    describe("shuffle", () => {
      describe("length", () => {
        it(`should be ${MAX_NO_OF_CARDS}`, () => {
          assert.equal(deck.shuffle().length, MAX_NO_OF_CARDS);
        });
      });

      it("should have every card", () => {
        deck.shuffle().forEach((shuffleCard) => {
          const card = deck.cards.find((card) => {
            return (
              card.shape === shuffleCard.shape &&
              card.value === shuffleCard.value
            );
          });
          assert.isDefined(card);
        });
      });
    });

    it("should have .shuffle()", () => {
      assert.typeOf(deck.shuffle, "function");
    });

    it("should have instances of Card", () => {
      deck.cards.forEach((card) => assert.instanceOf(card, Card));
    });
  });
});
