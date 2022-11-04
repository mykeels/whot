import Shapes from "./shapes";
import createError from "./errors";
import { createTypeError } from "./errors";
import { EventEmitter } from "events";
import createLogger from "./logger";
import Card from "./card";

const logger = createLogger("pile.js");
const InvalidArgumentTypeError = createTypeError("InvalidArgumentTypeError");
/** blocks attempts to play a card that doesn't match the top card in the pile */
const LastCardMismatchError = createError("LastCardMismatchError");
/** blocks attempts to play no cards */
const NoCardSuppliedError = createError("NoCardSuppliedError");

type PileProps = {
  emitter: EventEmitter;
};

/**
 * @event pile:push
 * @event pile:reset
 */
export class Pile {
  emitter: EventEmitter;
  cards: Card[] = [];
  noOfPlays = 0;

  constructor(props: PileProps) {
    if (!props.emitter) {
      logger.warn("props.emitter not defined");
      this.emitter = props.emitter = new EventEmitter();
    } else {
      this.emitter = props.emitter;
    }
  }

  top = () => this.cards[this.cards.length - 1] || null;
  firstCardIsWhot = () =>
    this.top().shape === Shapes.Whot && this.noOfPlays === 1;
  push = (_cards_: Card[]) => {
    if (Array.isArray(_cards_)) {
      if (_cards_.length > 0) {
        const lastCard = _cards_[_cards_.length - 1];
        if (
          !this.top() ||
          this.top().matches(lastCard) ||
          this.firstCardIsWhot()
        ) {
          this.top() && this.top().reset(); //reset card to original config (e.g. set iNeed to null)
          _cards_.forEach((card) => {
            this.cards.push(card);
          });
          this.emitter.emit("pile:push", _cards_);
          this.noOfPlays += _cards_.length;
        } else {
          throw LastCardMismatchError(
            `pile: ${this.top()?.render()}, play: ${lastCard?.render()}`
          );
        }
      } else {
        throw NoCardSuppliedError("");
      }
    } else {
      throw InvalidArgumentTypeError("_cards_", "Array");
    }
  };
  reset = () => {
    this.emitter.emit("pile:reset", this.top());
    return this.cards.splice(0, this.cards.length - 1);
  };
}

export default Pile;
