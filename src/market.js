const Deck = require('./deck')
const Card = require("../src/card")
const Shapes = require("../src/shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const logger = require('./logger')('player.js')

const OutOfRangeError = createError('OutOfRangeError')

/**
 * 
 * @param {Object} props
 * @param {Number} props.noOfDecks how many card decks should be in the market?
 * @param {Function} props.pile returns Pile instance
 */
const Market = function (props = {}) {
    props.noOfDecks = props.noOfDecks || 1 

    let cards = []

    for (let i = 1; i<= props.noOfDecks; i++) {
        const deck = new Deck()
        deck.shuffle().forEach(card => cards.push(card))
    }

    this.pick = (no = 1) => {
        if (no >= cards.length) {
            if (!props.pile) throw OutOfRangeError('cards')
            else {
                // get more cards from the pile
                props.pile().reset().forEach(card => cards.push(card))
                cards = cards.sort((a, b) => Math.random() - 0.5)
            }
        }
        return cards.splice(0, no)
    }

    this.count = () => cards.length
}

module.exports = Market