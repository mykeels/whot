import { Shapes, renderShape, CardShape } from "./shapes";
import { createError, createTypeError } from "./errors";
import { eventify, EventEmitter } from "./events";
import Card from "./card";
import Pile from "./pile";
import Market from "./market";
import Moves, { CardMove } from "./moves";
import createLogger from "./logger";

const logger = createLogger("player.js");

const CardNotFoundError = createError("CardNotFoundError");
const OutOfTurnError = createError("OutOfTurnError");
const InvalidArgumentError = createError("InvalidArgumentError");
const ExpectedToPickError = createError("ExpectedToPickError");
const PlayValidationFailedError = createError("PlayValidationFailedError");
const InvalidArgumentTypeError = createTypeError("InvalidArgumentTypeError");
const CardNeededUndefinedError = createTypeError("CardNeededUndefinedError");

type PlayerProps = {
  id: number;
  emitter: EventEmitter;
  market: () => Market;
  pile: () => Pile;
};

/**
 * A player participates in a whot game, by holding and playing a card when it's his/her turn
 *
 * @event player:play when a card is played by being added to the pile
 * @event player:market when the player goes to market
 */
export class Player {
  id: number;
  emitter: EventEmitter;
  market: () => Market;
  pile: () => Pile;
  cards: Card[] = [];
  turn = false;
  hasWon = false;
  toPick = 0;
  emit: (event: string, data: any) => Player = () => this;

  constructor(props: PlayerProps) {
    if (!props) throw InvalidArgumentError("props");
    if (!props.id) throw InvalidArgumentError("props.id");
    if (!props.market || typeof props.market !== "function")
      throw InvalidArgumentError("props.market");
    if (!props.pile) logger.warn("No Pile Function supplied");
    else if (typeof props.pile !== "function")
      throw InvalidArgumentError("props.pile must be a function");
    if (!props.emitter) {
      logger.warn("No EventEmitter supplied");
      this.emitter = props.emitter = new EventEmitter();
    } else {
      this.emitter = props.emitter;
    }
    this.id = props.id;
    this.market = props.market;
    this.pile = props.pile;
    eventify(this);
  }

  /**
   * checks that it is possible to play a card
   *
   * condition is true if:
   *   - card matches card at the top of the pile
   *   - top pile card is a Whot!, and is the first card in the game
   */
  validator = (card: Card) =>
    this.pile().top().matches(card) || this.pile().firstCardIsWhot();

  add = (_cards_: Card[]) => {
    if (Array.isArray(_cards_)) {
      _cards_.forEach((card) => this.cards.push(card));
      this.emitter.emit("player:add", _cards_);
      this.emit("add", _cards_);
    } else {
      throw InvalidArgumentTypeError("_cards_", "Array");
    }
  };

  hand = () => this.cards.slice(0);

  pick = () => {
    const marketCards = this.market().pick(this.toPick || 1);
    if (!Array.isArray(marketCards))
      throw InvalidArgumentTypeError("marketCards", "Array");
    this.add(marketCards);
    this.emit("market", marketCards);
    this.emitter.emit("player:market", this, marketCards);
    this.toPick = 0;
    return marketCards;
  };

  play = (index: number, iNeed: CardShape) => {
    if (this.turn) {
      const card = this.cards[index];
      if (card) {
        if (this.toPick === 0 || card.shape === Shapes.Whot) {
          if (card.shape === Shapes.Whot) {
            if (!iNeed) {
              throw CardNeededUndefinedError(
                `player: ${this.id}, card: ${card.shape}, iNeed: ${iNeed}`,
                "String"
              );
            } else {
              card.iNeed = iNeed;
            }
          }
          if (this.validator(card)) {
            this.cards.splice(index, 1);
            this.emit("play", card);
            this.emitter.emit("player:play", this, card);
            if (typeof this.pile === "function") {
              this.pile().push([card]);
            }
            if (this.empty()) {
              if (this.pile().top().move === Moves.None) {
                this.emitter.emit("player:checkup", this);
                this.emit("checkup", this);
                this.hasWon = true;
              } else {
                this.pick();
              }
            }
            if (this.lastCard()) {
              this.emitter.emit("player:last-card", this);
              this.emit("last-card", this);
            }
            return card;
          } else {
            throw PlayValidationFailedError(
              JSON.stringify({ top: this.pile().top(), card })
            );
          }
        } else {
          throw ExpectedToPickError(
            `player ${this.id} is expected to pick ${this.toPick} cards from market`
          );
        }
      } else {
        throw CardNotFoundError(
          `no card found in player ${this.id} pile at index ${index}`
        );
      }
    } else {
      throw OutOfTurnError(`player ${this.id} is out of turn`);
    }
  };

  lastCard = () => this.cards.length === 1;

  empty = () => this.cards.length === 0;

  canPlay = () =>
    this.cards.findIndex((card) => card.matches(this.pile().top())) >= 0 &&
    this.toPick === 0;

  canMatchMove = (move: CardMove) =>
    this.cards.findIndex(
      (card) => card.move === (move || this.pile().top().move)
    ) >= 0;

  render = () =>
    `id: ${this.id} count: ${this.cards.length} hand: [${this.cards
      .map((card) => card.value + renderShape(card.shape))
      .join(",")}]`;
}

export default Player;
