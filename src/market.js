const Deck = require('./deck')
const Card = require("../src/card")
const Shapes = require("../src/shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const logger = require('./logger')('player.js')

const OutOfRangeError = createError('OutOfRangeError')

const Market = function (noOfDecks = 1) {
    const cards = []

    for (let i = 1; i<= noOfDecks; i++) {
        const deck = new Deck()
        deck.shuffle().forEach(card => cards.push(card))
    }

    this.pick = (no = 1) => {
        if (no >= cards.length) {
            throw OutOfRangeError('cards')
        }
        else {
            return cards.splice(0, no)
        }
    }

    this.count = () => cards.length
}

module.exports = Market