import Card from "./card";
import Market from "./market";
import Pile from "./pile";
import Player from "./player";
import Turn from "./turn";
import { EventEmitter, emitter } from "./events";
import { createTypeError } from "./errors";
import createLogger from "./logger";

const logger = createLogger("index.js");
const InvalidArgumentTypeError = createTypeError("InvalidArgumentTypeError");

type GameProps = {
  noOfDecks: number;
  noOfPlayers: number;
  firstCard?: Card;
};

export class Game {
  noOfDecks = 1;
  noOfPlayers = 0;
  pile: Pile;
  market: Market;
  turn: Turn;
  players: Player[] = [];
  emitter: EventEmitter;

  constructor(props: GameProps) {
    if (!Number(props.noOfDecks))
      throw InvalidArgumentTypeError("props.noOfDecks", Number);
    if (!Number(props.noOfPlayers))
      throw InvalidArgumentTypeError("props.noOfPlayers", Number);
    this.noOfDecks = Number(props.noOfDecks || 1);
    this.noOfPlayers = props.noOfPlayers;

    this.pile = new Pile({ emitter });
    this.market = new Market({
      noOfDecks: props.noOfDecks,
      emitter,
      pile: () => this.pile,
    });
    this.initPlayers();
    this.turn = new Turn({
      players: this.players,
      emitter,
    });
    this.emitter = emitter;

    this.deal();
    this.turn.execute(this.playFirstCard(props.firstCard), true);
  }

  initPlayers() {
    this.players = [];
    // create and load players
    for (let i = 1; i <= this.noOfPlayers; i++) {
      const player = new Player({
        id: i,
        emitter,
        market: () => this.market,
        pile: () => this.pile,
      });
      this.players.push(player);
    }
  }

  /**
   * distribute 4 cards to each player one by one
   */
  deal = () => {
    for (let i = 1; i <= 4; i++) {
      this.players.forEach((player) => {
        player.pick();
      });
    }
  };

  playFirstCard = (firstCard?: Card) => {
    const cards = this.market.pick(1);
    if (firstCard) this.pile.push([firstCard]);
    else this.pile.push(cards);
    return cards[0];
  };
}

export default Game;
