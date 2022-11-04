import { createTypeError, createError } from "./errors";
import { EventEmitter } from "events";
import Player from "./player";
import Card from "./card";
import Moves from "./moves";
import createLogger from "./logger";
import Shapes from "./shapes";

const logger = createLogger("turn.js");
const NoCurrentPlayerError = createError("NoCurrentPlayerError");
const NoNextPlayerError = createError("NoNextPlayerError");
const PlayersNotEnoughError = createError("PlayersNotEnoughError");
const InvalidArgumentError = createError("InvalidArgumentError");
const InappropriateMoveError = createError("InappropriateMoveError");
const InvalidArgumentTypeError = createTypeError("InvalidArgumentTypeError");

type TurnProps = {
  players: Player[];
  emitter: EventEmitter;
};

/**
 * @event turn:switch
 * @event turn:holdon
 * @event turn:pick-two
 * @event turn:pick-three
 * @event turn:suspension
 */
export class Turn {
  players: Player[] = [];
  emitter: EventEmitter;

  constructor(props: TurnProps) {
    if (!Array.isArray(props.players)) {
      throw InvalidArgumentTypeError("props.players", Array);
    }
    if (!props.emitter) {
      logger.warn("props.emitter not undefined");
      this.emitter = props.emitter = new EventEmitter();
    } else {
      this.emitter = props.emitter;
    }
    this.players = props.players;
    this.initPlayers();
  }

  initPlayers() {
    if (this.players.length === 0)
      throw PlayersNotEnoughError(`players: ${this.players.length}`);

    this.players.forEach((player, index) => {
      player.turn = index === 0;
    });
  }

  next = () => this.players.find((player) => player.turn);

  all = (fn?: (player: Player) => void) => {
    if (fn && typeof fn === "function") this.players.forEach(fn);
    return this.players.length;
  };

  /**
   * @param {Number} skip ignore this number of players
   */
  switch = (skip = 0) => {
    const nextPlayerIndex =
      (this.players.findIndex((player) => player.turn) + ++skip) %
      this.players.length;
    const nextPlayer = this.players[nextPlayerIndex];
    const currentPlayer = this.next();
    if (!currentPlayer) {
      throw NoCurrentPlayerError("");
    }
    currentPlayer.turn = false;
    nextPlayer.turn = true;
    this.emitter.emit("turn:switch", skip, nextPlayer);
    return this;
  };

  /**
   * @param {number} noOfPlayers how many players are to pick
   * @param {number} count how many cards is each player to pick
   *
   * @returns affected players
   */
  setToPick = (noOfPlayers: number, count: number, noSwitch?: boolean) => {
    if (!Number(noOfPlayers)) throw InvalidArgumentError("noOfPlayers");
    if (!Number(count)) throw InvalidArgumentError("count");

    let currentPlayerIndex = noSwitch
      ? -1
      : this.players.findIndex((player) => player.turn);

    const ret = [];
    for (let i = 1; i <= noOfPlayers; i++) {
      let nextPlayerIndex = ++currentPlayerIndex % this.players.length;
      this.players[nextPlayerIndex].toPick = count;
      ret.push(this.players[nextPlayerIndex]);
    }
    return ret;
  };

  holdon = (noSwitch?: boolean) => {
    this.emitter.emit("turn:holdon", this.skipped(this.count() - 1));
    if (!noSwitch) this.switch(this.count() - 1);
  };

  pickTwo = (noSwitch?: boolean) => {
    let nextPlayer = this.next();
    if (!nextPlayer) {
      throw NoNextPlayerError("");
    }
    if (nextPlayer.toPick === 0 || nextPlayer.toPick === 2) {
      const affectedPlayers = this.setToPick(
        1,
        nextPlayer.toPick + 2,
        noSwitch
      );
      if (!noSwitch) nextPlayer.toPick = 0;
      this.emitter.emit("turn:pick-two", affectedPlayers[0]);
      if (!noSwitch) this.switch();
      return this;
    } else throw InappropriateMoveError("pickTwo");
  };

  pickThree = (noSwitch?: boolean) => {
    let nextPlayer = this.next();
    if (!nextPlayer) {
      throw NoNextPlayerError("");
    }
    if (nextPlayer.toPick === 0 || nextPlayer.toPick === 3) {
      const affectedPlayers = this.setToPick(
        1,
        nextPlayer.toPick + 3,
        noSwitch
      );
      if (!noSwitch) nextPlayer.toPick = 0;
      this.emitter.emit("turn:pick-three", affectedPlayers[0]);
      if (!noSwitch) this.switch();
      return this;
    } else throw InappropriateMoveError("pickThree");
  };

  skipped = (no: number) => {
    const ret = [];
    let currentPlayerIndex = this.players.findIndex((player) => player.turn);
    for (let i = 1; i <= no; i++) {
      let nextPlayerIndex = ++currentPlayerIndex % this.players.length;
      ret.push(this.players[nextPlayerIndex]);
    }
    return ret;
  };

  /**
   * @param {Boolean} isStar check if the card played is a star
   */
  suspension = (isStar?: boolean, noSwitch?: boolean) => {
    this.emitter.emit("turn:suspension", this.skipped(isStar ? 2 : 1));
    if (!noSwitch) this.switch(isStar ? 2 : 1);
  };

  generalMarket = (noSwitch?: boolean) => {
    const affectedPlayers = this.setToPick(this.count() - 1, 1, noSwitch);
    this.emitter.emit("turn:general-market", affectedPlayers);
    if (!noSwitch) this.switch();
    return affectedPlayers;
  };

  count = () => this.players.length;

  /**
   * @param {Card} card
   */
  execute = (card: Card, noSwitch?: boolean) => {
    if (card.move === Moves.GeneralMarket) {
      this.generalMarket(noSwitch);
    } else if (card.move === Moves.HoldOn) {
      this.holdon(noSwitch);
    } else if (card.move === Moves.PickThree) {
      this.pickThree(noSwitch);
    } else if (card.move === Moves.PickTwo) {
      this.pickTwo(noSwitch);
    } else if (card.move === Moves.Suspension) {
      this.suspension(card.shape === Shapes.Star, noSwitch);
    } else {
      if (!noSwitch) this.switch();
    }
  };
}

export default Turn;
