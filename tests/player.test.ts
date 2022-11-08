import { assert } from "chai";
import Player from "../src/player";
import Pile from "../src/pile";
import Market from "../src/market";
import Moves from "../src/moves";
import Shapes from "../src/shapes";
import { Card } from "../src/card";
import { EventEmitter } from "../src/events";

const emitter = new EventEmitter();
const pile = new Pile({ emitter });
pile.push([Card.createCircleCard({ value: 3 })]);
const market = new Market({ noOfDecks: 1, pile: () => pile, emitter });
const mockMarket = () => market;
const mockPile = () => pile;

describe("Player", () => {
  describe("Constructor", () => {
    it("should throw InvalidArgumentError if props argument is not supplied", () => {
      try {
        // @ts-ignore
        const player = new Player();

        //ensure it doesn't get here
        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "InvalidArgumentError");
        assert.equal(err.message, "props");
      }
    });

    it("should throw InvalidArgumentError if props.id argument is not supplied", () => {
      try {
        // @ts-ignore
        const player = new Player({});

        //ensure it doesn't get here
        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "InvalidArgumentError");
        assert.equal(err.message, "props.id");
      }
    });

    it("should throw InvalidArgumentError if props.market argument is either not supplied, or is supplied but is not a function", () => {
      try {
        // @ts-ignore
        const player = new Player({
          id: 1,
          // @ts-ignore
          validator: (card) => true,
          emitter,
        });

        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "InvalidArgumentError");
        assert.equal(err.message, "props.market");
      }

      try {
        // @ts-ignore
        const player = new Player({
          id: 1,
          // @ts-ignore
          validator: (card) => true,
          emitter,
          // @ts-ignore
          market: {},
        });

        assert.fail();
      } catch (err: any) {
        assert.equal(err.name, "InvalidArgumentError");
        assert.equal(err.message, "props.market");
      }
    });

    it("should work when appropriate values are passed", () => {
      const player = new Player({
        id: 1,
        // @ts-ignore
        validator: (card) => true,
        emitter,
        market: mockMarket,
        pile: mockPile,
      });
    });

    it("should initialise emitter when not supplied in prop", () => {
      const props = {
        id: 1,
        // @ts-ignore
        validator: (card) => true,
        market: mockMarket,
        pile: mockPile,
        emitter: undefined,
      };
      assert.isUndefined(props.emitter);
      // @ts-ignore
      const player = new Player(props);
      assert.isDefined(props.emitter);
    });
  });

  describe("Cards", () => {
    const player = new Player({
      id: 1,
      emitter: new EventEmitter(),
      market: mockMarket,
      pile: mockPile,
    });
    describe("Count", () => {
      it("should initially be 0", () => {
        assert.equal(player.hand.length, 0);
      });
    });

    describe("Add", () => {
      it("should throw InvalidArgumentTypeError(Array) if invalid argument is supplied", () => {
        try {
          // @ts-ignore
          player.add({});

          //ensure it doesn't get here
          assert.fail();
        } catch (err: any) {
          assert.equal(err.name, "InvalidArgumentTypeError");
          assert.equal(err.type, Array);
        }
      });

      it("should add expected number of cards if supplied", () => {
        // @ts-ignore
        player.add([{}, {}, {}]);
        assert.equal(player.hand().length, 3);
      });
    });

    describe("Move", () => {
      it("can match PickThree move", () => {
        const player = new Player({
          id: 1,
          emitter: new EventEmitter(),
          market: mockMarket,
          pile: () => ({
            // @ts-ignore
            top: () => ({ move: Moves.PickThree }),
          }),
        });

        // @ts-ignore
        player.add([{ move: null }, { move: null }, { move: Moves.PickThree }]);

        assert.isTrue(player.canMatchMove());
      });

      it("can NOT match move", () => {
        const player = new Player({
          id: 1,
          emitter: new EventEmitter(),
          market: mockMarket,
          pile: () => ({
            // @ts-ignore
            top: () => ({ move: Moves.PickThree }),
          }),
        });

        // @ts-ignore
        player.add([{ move: null }, { move: null }, { move: null }]);

        assert.isFalse(player.canMatchMove());
      });
    });

    describe("Play", () => {
      it("should throw OutOfTurnError if not in turn", () => {
        try {
          player.play(0);

          //ensure it doesn't get here
          assert.fail();
        } catch (err: any) {
          assert.equal(err.name, "OutOfTurnError");
        }
      });

      it("should throw CardNotFoundError if card index cannot be found", () => {
        try {
          player.turn = true;
          player.play(-1);

          //ensure it doesn't get here
          assert.fail();
        } catch (err: any) {
          assert.equal(err.name, "CardNotFoundError");
        }
      });

      it("should work", () => {
        let somePlayer = new Player({
          id: 1,
          // @ts-ignore
          validator: (card) => true,
          emitter: new EventEmitter(),
          market: mockMarket,
          pile: mockPile,
        });
        const card1 = Card.createCircleCard({ value: 4 });
        const card2 = Card.createSquareCard({ value: 2 });
        somePlayer.turn = true;
        somePlayer.add([card1, card2]);
        assert.equal(somePlayer.hand().length, 2);
        somePlayer.play(0);
        assert.equal(somePlayer.hand().length, 1);
      });

      it("should reach checkup", () => {
        let somePlayer = new Player({
          id: 1,
          // @ts-ignore
          validator: (card) => true,
          emitter: new EventEmitter(),
          market: mockMarket,
          pile: mockPile,
        });
        const card1 = Card.createCircleCard({ value: 4 });
        somePlayer.turn = true;
        somePlayer.add([card1]);
        assert.equal(somePlayer.hand().length, 1);
        somePlayer.play(0);
        assert.equal(somePlayer.hand().length, 0);
        assert.isTrue(somePlayer.hasWon);
      });

      it("should pick from market and NOT reach checkup", () => {
        let somePlayer = new Player({
          id: 1,
          // @ts-ignore
          validator: (card) => true,
          emitter: new EventEmitter(),
          market: mockMarket,
          pile: mockPile,
        });
        const card1 = Card.createCircleCard({ value: 5 });
        somePlayer.turn = true;
        somePlayer.add([card1]);
        assert.equal(somePlayer.hand().length, 1);
        somePlayer.play(0);
        assert.equal(somePlayer.hand().length, 1);
        assert.isFalse(somePlayer.hasWon);
      });

      it("should play iNeed", () => {
        let somePlayer = new Player({
          id: 1,
          // @ts-ignore
          validator: (card) => true,
          emitter: new EventEmitter(),
          market: mockMarket,
          pile: mockPile,
        });
        const card1 = Card.createWhotCard({
          value: 20,
        });
        const card2 = Card.createCircleCard({ value: 6 });
        somePlayer.turn = true;
        somePlayer.add([card1, card2]);
        somePlayer.play(0, Shapes.Circle);
        assert.equal(pile.top().shape, Shapes.Whot);
        assert.equal(pile.top().iNeed, Shapes.Circle);
      });

      it("should throw PlayValidationFailedError", () => {
        try {
          let somePlayer = new Player({
            id: 1,
            // @ts-ignore
            validator: (card) => true,
            emitter: new EventEmitter(),
            market: mockMarket,
            pile: mockPile,
          });
          const card1 = Card.createSquareCard({ value: 6 });
          somePlayer.turn = true;
          somePlayer.add([card1]);
          somePlayer.play(0);
          assert.fail();
        } catch (err: any) {
          assert.equal(err.name, "PlayValidationFailedError");
        }
      });

      it("should throw ExpectedToPickError", () => {
        try {
          let somePlayer = new Player({
            id: 1,
            // @ts-ignore
            validator: (card) => true,
            emitter: new EventEmitter(),
            market: mockMarket,
            pile: mockPile,
          });
          const card1 = Card.createCircleCard({ value: 2 });
          const card2 = Card.createCircleCard({ value: 6 });
          somePlayer.turn = true;
          somePlayer.add([card1, card2]);
          somePlayer.play(0);
          somePlayer.toPick = 2;
          somePlayer.play(0);
          assert.fail();
        } catch (err: any) {
          assert.equal(err.name, "ExpectedToPickError");
        }
      });

      it("should throw CardNeededUndefinedError", () => {
        try {
          let somePlayer = new Player({
            id: 1,
            // @ts-ignore
            validator: (card) => true,
            emitter: new EventEmitter(),
            market: mockMarket,
            pile: mockPile,
          });
          const card1 = Card.createWhotCard({
            value: 0,
          });
          somePlayer.turn = true;
          somePlayer.add([card1]);
          somePlayer.play(0);
          assert.fail();
        } catch (err: any) {
          assert.equal(err.name, "CardNeededUndefinedError");
        }
      });
    });
  });
});
