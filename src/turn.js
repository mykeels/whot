const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter

const PlayersNotEnoughError = createError('PlayersNotEnoughError')
const InvalidArgumentError = createError('InvalidArgumentError')
const InappropriateMoveError = createError('InappropriateMoveError')
const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')

/**
 * 
 * @param {Object} props
 * @param {Object[]} props.players
 * @param {EventEmitter} props.emitter 
 */
const Turn = function (props = {}) {
    if (!Array.isArray(props.players)) {
        throw InvalidArgumentTypeError('props.players', Array)
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
        return this
    }

    /**
     * @param {Number} noOfPlayers how many players are to pick
     * @param {Number} count how many cards is each player to pick
     */
    this.setToPick = (noOfPlayers, count) => {
        if (!Number(noOfPlayers)) throw InvalidArgumentError('noOfPlayers')
        if (!Number(count)) throw InvalidArgumentError('count')
        
        let currentPlayerIndex = players.findIndex(player => player.turn)
        
        for (let i = 1; i <= noOfPlayers; i++) {
            let nextPlayerIndex = ((++currentPlayerIndex) % players.length)
            const nextPlayer = players[nextPlayerIndex]
            nextPlayer.toPick = count
        }
    }

    this.holdon = () => this.switch(this.count() - 1)

    this.pickTwo = () => {
        let nextPlayer = this.next()
        if (nextPlayer.toPick === 0 || nextPlayer.toPick === 2) {
            this.setToPick(1, nextPlayer.toPick + 2)
            nextPlayer.toPick = 0
            return this
        }
        else throw InappropriateMoveError('pickTwo')
    }

    this.pickThree = () => {
        let nextPlayer = this.next()
        if (nextPlayer.toPick === 0 || nextPlayer.toPick === 3) {
            this.setToPick(1, nextPlayer.toPick + 3)
            nextPlayer.toPick = 0
            return this
        }
        else throw InappropriateMoveError('pickThree')
    }

    /**
     * @param {Boolean} isStar check if the card played is a star
     */
    this.suspension = (isStar) => this.switch(isStar ? 2 : 1)

    this.count = () => players.length
}

module.exports = Turn