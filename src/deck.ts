import createLogger from "./logger";
import { EventEmitter } from "./events";
import { Card } from "./card";

const logger = createLogger("deck.js");
const circles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14];
const triangles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14];
const crosses = [1, 2, 3, 5, 7, 10, 11, 13, 14];
const squares = [1, 2, 3, 5, 7, 10, 11, 13, 14];
const stars = [1, 2, 3, 4, 5, 7, 8];
const whots = [20, 20, 20, 20, 20];

type DeckProps = {
  emitter: EventEmitter;
};

/**
 * @event deck:create
 * @event deck:shuffle
 */
export class Deck {
  emitter: EventEmitter;
  cards: Card[] = [];

  constructor(props: DeckProps) {
    if (!props.emitter) {
      logger.warn("props.emitter not defined");
      this.emitter = new EventEmitter();
    } else {
      this.emitter = props.emitter;
    }
    this.shuffle();
  }

  shuffle() {
    this.cards = [
      ...circles.map((value) => Card.createCircleCard({ value })),
      ...triangles.map((value) => Card.createTriangleCard({ value })),
      ...crosses.map((value) => Card.createCrossCard({ value })),
      ...squares.map((value) => Card.createSquareCard({ value })),
      ...stars.map((value) => Card.createStarCard({ value })),
      ...whots.map((value) => Card.createWhotCard({ value })),
    ];
    this.cards = this.cards
      .map((card, index) => index)
      .sort((a, b) => Math.random() - 0.5)
      .map((index) => this.cards[index]);
    if (this.emitter && typeof this.emitter.emit === "function") {
      this.emitter.emit("deck:shuffle", this.cards);
    }
    logger.warn("cards shuffled");
    return this.cards;
  }
}

export default Deck;
