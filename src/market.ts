import Deck from "./deck";
import createError from "./errors";
import { EventEmitter } from "events";
import createLogger from "./logger";
import Pile from "./pile";
import Card from "./card";

const logger = createLogger("market.js");

const OutOfRangeError = createError("OutOfRangeError");
const PropNotFoundError = createError("PropNotFoundError");

type MarketProps = {
  noOfDecks?: number;
  emitter: EventEmitter;
  pile: () => Pile;
};

/**
 * @event market:create
 * @event market:pick
 */
export class Market {
  noOfDecks: number;
  emitter: EventEmitter;
  pile: () => Pile;
  private cards: Card[] = [];

  constructor(props: MarketProps) {
    this.noOfDecks = props.noOfDecks || 1;
    this.pile = props.pile;
    if (!props.emitter) {
      logger.warn("props.emitter not defined");
      this.emitter = props.emitter = new EventEmitter();
    } else {
      this.emitter = props.emitter;
    }
    this.shuffle();
  }

  shuffle = () => {
    this.cards = [];
    for (let i = 1; i <= this.noOfDecks; i++) {
      const deck = new Deck({ emitter: this.emitter });
      deck.shuffle().forEach((card) => {
        this.cards.push(card);
      });
    }
    this.emitter.emit("market:create", this.cards.slice(0));
  };

  pick = (no = 1) => {
    if (no >= this.cards.length) {
      if (!this.pile) throw PropNotFoundError("pile");
      else {
        // get more cards from the pile
        this.pile()
          .reset()
          .forEach((card) => this.cards.push(card));
        this.cards = this.cards.sort((a, b) => Math.random() - 0.5);

        if (no > this.cards.length) {
          throw OutOfRangeError("cards");
        }
      }
    }
    const pickedCards = this.cards.splice(0, no);
    this.emitter.emit("market:pick", pickedCards);
    return pickedCards;
  };

  count = () => this.cards.length;
}

export default Market;
