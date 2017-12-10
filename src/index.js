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
const { eventify } = require('./events')
// do you have photoshop?

const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')

/**
 * @constructor
 * @augments EventEmitter
 * 
 * @param {Object} props
 * @param {Number} props.noOfDecks
 * @param {Number} props.noOfPlayers
 */
const Game = function (props = {}) {
    props.noOfDecks = Number(props.noOfDecks || 1)
    
    if (!Number(props.noOfDecks)) throw InvalidArgumentTypeError('props.noOfDecks')
    if (!Number(props.noOfPlayers)) throw InvalidArgumentTypeError('props.noOfPlayers')
    
    eventify(this)

    const pile = new Pile({ emitter })
    
    const market = new Market({ noOfDecks: props.noOfDecks, emitter, pile: () => pile })

    const players = []

    for(let i = 1; i <= props.noOfPlayers; i++) {
        const player = new Player({
            id: i,
            emitter,
            market: () => market,
            pile: () => pile
        })
        // player.on('market', (cards) => logger.log(`player ${player.id}:`, '(market)', cards.length))
        players.push(player)
    }

    const turn = new Turn({
        players,
        emitter
    })

    this.turn = turn
    this.market = market
    this.pile = pile
    this.emitter = emitter

    const deal = () => {
        for (let i = 1; i <= 4; i++) {
            players.forEach(player => {
                player.pick()
            })
        }
    }

    const playFirstCard = () => {
        const cards = market.pick(1)
        pile.push(cards)
        return cards[0]
    }
    
    deal() //send 4 cards to each player
    turn.execute(playFirstCard())
}

module.exports = Game