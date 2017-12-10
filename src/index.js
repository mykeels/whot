const Card = require('./card')
const Deck = require('./deck')
const Market = require('./market')
const Pile = require('./pile')
const Player = require('./player')
const Turn = require('./turn')
const emitter = require('./events')
const createError = require('./errors')
const { createTypeError } = require('./errors')
const logger = require('./logger')('index.js')
// do you have photoshop?

const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')

/**
 * @param {Object} props
 * @param {Number} props.noOfDecks
 * @param {Number} props.noOfPlayers
 */
const Game = function (props = {}) {
    props.noOfDecks = Number(props.noOfDecks || 1)
    
    if (!Number(props.noOfDecks)) throw InvalidArgumentTypeError('props.noOfDecks')
    if (!Number(props.noOfPlayers)) throw InvalidArgumentTypeError('props.noOfPlayers')

    const pile = new Pile({ emitter })
    
    const market = new Market({ noOfDecks: props.noOfDecks, emitter, pile: () => pile })

    const players = []

    for(let i = 1; i <= props.noOfPlayers; i++) {
        const player = new Player({
            id: i,
            emitter,
            validator: () => pile.top().matches(this),
            market: () => market
        })
        player.on('play', (card) => {
            logger.log(card)
        })
        players.push(player)
    }

    const turn = new Turn({
        players,
        emitter
    })

    this.turn = turn
    this.market = market
    this.pile = pile
}

module.exports = Game