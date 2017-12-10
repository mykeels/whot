const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const Player = require('./player')
const logger = require('./logger')('turn.js')
const Card = require('./card')
const Moves = require('./moves')

const PlayersNotEnoughError = createError('PlayersNotEnoughError')
const InvalidArgumentError = createError('InvalidArgumentError')
const InappropriateMoveError = createError('InappropriateMoveError')
const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')

/**
 * 
 * @param {Object} props
 * @param {Player[]} props.players
 * @param {EventEmitter} props.emitter 
 * 
 * @event turn:switch
 * @event turn:holdon
 * @event turn:pick-two
 * @event turn:pick-three
 * @event turn:suspension
 */
const Turn = function (props = {}) {
    if (!Array.isArray(props.players)) {
        throw InvalidArgumentTypeError('props.players', Array)
    }
    if (!props.emitter) {
        logger.warn('props.emitter not undefined')
        props.emitter = new EventEmitter()
    }

    const players = props.players

    if (players.length === 0) throw PlayersNotEnoughError()
    
    players.forEach((player, index) => {
        player.turn = index === 0
    })

    this.next = () => players.find(player => player.turn)

    /**
     * @param {Number} skip ignore this number of players
     */
    this.switch = (skip = 0) => {
        const nextPlayerIndex = (players.findIndex(player => player.turn) + ++skip) % players.length
        const nextPlayer = players[nextPlayerIndex]
        const currentPlayer = this.next()
        currentPlayer.turn = false
        nextPlayer.turn = true
        props.emitter.emit('turn:switch', skip, nextPlayer)
        return this
    }

    /**
     * @param {Number} noOfPlayers how many players are to pick
     * @param {Number} count how many cards is each player to pick
     * 
     * @returns affected players
     */
    this.setToPick = (noOfPlayers, count, noSwitch) => {
        if (!Number(noOfPlayers)) throw InvalidArgumentError('noOfPlayers')
        if (!Number(count)) throw InvalidArgumentError('count')
        
        let currentPlayerIndex = noSwitch ? -1 : players.findIndex(player => player.turn)
        
        const ret = []
        for (let i = 1; i <= noOfPlayers; i++) {
            let nextPlayerIndex = ((++currentPlayerIndex) % players.length)
            players[nextPlayerIndex].toPick = count
            ret.push(players[nextPlayerIndex])
        }
        return ret
    }

    this.holdon = (noSwitch) => {
        props.emitter.emit('turn:holdon', skipped(this.count() - 1))
        if (!noSwitch) this.switch(this.count() - 1)
    }

    this.pickTwo = (noSwitch) => {
        let nextPlayer = this.next()
        if (nextPlayer.toPick === 0 || nextPlayer.toPick === 2) {
            const affectedPlayers = this.setToPick(1, nextPlayer.toPick + 2, noSwitch)
            if (!noSwitch) nextPlayer.toPick = 0
            props.emitter.emit('turn:pick-two', affectedPlayers[0])
            if (!noSwitch) this.switch()
            return this
        }
        else throw InappropriateMoveError('pickTwo')
    }

    this.pickThree = (noSwitch) => {
        let nextPlayer = this.next()
        if (nextPlayer.toPick === 0 || nextPlayer.toPick === 3) {
            const affectedPlayers = this.setToPick(1, nextPlayer.toPick + 3, noSwitch)
            if (!noSwitch) nextPlayer.toPick = 0
            props.emitter.emit('turn:pick-three', affectedPlayers[0])
            if (!noSwitch) this.switch()
            return this
        }
        else throw InappropriateMoveError('pickThree')
    }

    const skipped = (no) => {
        const ret = []
        let currentPlayerIndex = players.findIndex(player => player.turn)
        for (let i = 1; i <= no; i++) {
            let nextPlayerIndex = ((++currentPlayerIndex) % players.length)
            ret.push(players[nextPlayerIndex])
        }
        return ret
    }

    /**
     * @param {Boolean} isStar check if the card played is a star
     */
    this.suspension = (isStar, noSwitch) => {
        props.emitter.emit('turn:suspension', skipped(isStar ? 2 : 1))
        if (!noSwitch) this.switch(isStar ? 2 : 1)
    }

    this.generalMarket = (noSwitch) => {
        const affectedPlayers = this.setToPick(this.count() - 1, 1, noSwitch)
        props.emitter.emit('turn:general-market', affectedPlayers)
        if (!noSwitch) this.switch()
        return affectedPlayers
    }

    this.count = () => players.length

    /**
     * @param {Card} card
     */
    this.execute = (card, noSwitch) => {
        if (card.move === Moves.GeneralMarket) {
            this.generalMarket(noSwitch)
        }
        else if (card.move === Moves.HoldOn) {
            this.holdon(noSwitch)
        }
        else if (card.move === Moves.PickThree) {
            this.pickThree(noSwitch)
        }
        else if (card.move === Moves.PickTwo) {
            this.pickTwo(noSwitch)
        }
        else if (card.move === Moves.Suspension) {
            this.suspension(noSwitch)
        }
        else {
            if (!noSwitch) this.switch()
        }
    }
}

module.exports = Turn