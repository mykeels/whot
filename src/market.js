const Deck = require('./deck')
const Card = require("../src/card")
const Shapes = require("../src/shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const logger = require('./logger')('market.js')

const OutOfRangeError = createError('OutOfRangeError')

/**
 * 
 * @param {Object} props
 * @param {Number} props.noOfDecks how many card decks should be in the market?
 * @param {Function} props.pile returns Pile instance
 * @param {EventEmitter} props.emitter
 * 
 * @event market:create
 * @event market:pick
 */
const Market = function (props = {}) {
    props.noOfDecks = props.noOfDecks || 1

    if (!props.emitter) {
        logger.warn('props.emitter not defined')
        props.emitter = new EventEmitter()
    }
    
    /**
     * @type {Card[]}
     */
    let cards = []

    for (let i = 1; i<= props.noOfDecks; i++) {
        const deck = new Deck()
        deck.shuffle().forEach(card => cards.push(card))
    }

    props.emitter.emit('market:create', cards.slice(0))

    this.pick = (no = 1) => {
        if (no >= cards.length) {
            if (!props.pile) throw OutOfRangeError('cards')
            else {
                // get more cards from the pile
                props.pile().reset().forEach(card => cards.push(card))
                cards = cards.sort((a, b) => Math.random() - 0.5)
            }
        }
        const pickedCards = cards.splice(0, no)
        props.emitter.emit('market:pick', pickedCards)
        return pickedCards
    }

    this.count = () => cards.length
}

module.exports = Market