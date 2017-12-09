const Deck = require('./deck')
const Card = require("../src/card")
const Shapes = require("../src/shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const logger = require('./logger')('player.js')

const LastCardMismatchError = createError('LastCardMismatchError') //to block attempts to play a card that doesn't match the top card in the pile
const NoCardSuppliedError = createError('NoCardSuppliedError') //to block attempts to play no cards

const Pile = function () {
    const cards = []

    this.top = () => cards[cards.length - 1]

    this.push = (_cards_ = []) => {
        if (_cards_.length > 0) {
            const lastCard = _cards_[_cards_.length - 1]
            if (!this.top() || this.top().matches(lastCard)) {
                _cards_.forEach(card => cards.push(card))
            }
            else {
                throw LastCardMismatchError({ pile: this.top(), play: lastCard })
            }
        }
        else {
            throw NoCardSuppliedError()
        }
    }

    this.reset = () => {
        return cards.splice(0, cards.length - 1)
    }
}

module.exports = Pile