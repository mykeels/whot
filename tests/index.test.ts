import { assert } from "chai";
import Shapes, { CardShape } from "../src/shapes";
import Game from "../src";
import createLogger from "../src/logger";
import Card from "../src/card";
import Player from "../src/player";

const logger = createLogger("index.test.js");

const makeRandomPlay = (player: Player, game: Game) => {
  if (player.canPlay()) {
    const compatibles = player
      .hand()
      .filter((card) => card.matches(game.pile.top()));
    const compatibleCardIndex = player
      .hand()
      .indexOf(compatibles[Math.floor(Math.random() * compatibles.length)]);
    let iNeed: CardShape | undefined = undefined;
    if (player.hand()[compatibleCardIndex].shape === Shapes.Whot) {
      const eligibleCards = player
        .hand()
        .filter((card) => card.shape != Shapes.Whot);
      iNeed =
        (eligibleCards[Math.floor(Math.random() * eligibleCards.length)] || {})
          .shape || Shapes.Circle;
    }
    player.play(compatibleCardIndex, iNeed);
    game.turn.execute(game.pile.top());
  } else {
    const marketCards = player.pick();
    game.turn.switch();
  }
};

describe("Game", () => {
  describe("Constructor", () => {
    it("should throw InvalidArgumentTypeError", () => {
      try {
        const game = new Game({
            noOfDecks: 1,
            // @ts-ignore
            noOfPlayers: null
        });
      } catch (err: any) {
        assert.equal(err.name, "InvalidArgumentTypeError");
        assert.equal(err.message, "props.noOfPlayers");
      }
    });

    it("should work", () => {
      const game = new Game({
        noOfDecks: 2,
        noOfPlayers: 4,
      });
      let endGame = false;
      game.emitter.on("player:play", (player, card) => {
        logger.log(
          player.render(),
          "| old:",
          game.pile.top().render(),
          "| play:",
          card.render()
        );
      });
      game.emitter.on("player:market", (player: Player, marketCards: Card[]) => {
        logger.warn(
          player.render(),
          "| old:",
          game.pile.top().render(),
          "| market:",
          marketCards.map((card) => card.render()).join(", ")
        );
      });
      logger.warn(
        "Game Start: top:",
        game.pile.top().render(),
        " | ",
        game.turn?.next()?.render()
      );
      for (let i = 1; i <= 50; i++) {
        if (!endGame) {
            const nextPlay = game.turn?.next();
            if (!nextPlay) {
                throw new Error("nextPlay cannot be undefined");
            }
            makeRandomPlay(nextPlay, game);
        }
      }
    });

    it("should have Whot! as its first card", () => {
      const game = new Game({
        noOfDecks: 1,
        noOfPlayers: 2,
        firstCard: Card.createWhotCard({
            value: 20
        }),
      });
      assert.equal(game.pile.top().shape, Shapes.Whot);
    });

    it("should play !Whot card when whot card is first in the pile", () => {
      const game = new Game({
        noOfDecks: 1,
        noOfPlayers: 2,
        firstCard: Card.createWhotCard({
            value: 20
        }),
      });
      let player = game.turn.next();

      while (!player?.canPlay()) {
        const marketCards = player?.pick();
        game.turn.switch();
        player = game.turn.next();
      }

      const compatibleCardIndex = player
        .hand()
        .findIndex((card) => Shapes.Whot !== card.shape);

      const card = player.hand()[compatibleCardIndex];

      assert.notEqual(card.shape, Shapes.Whot);

      player.play(compatibleCardIndex);
    });
  });
});
