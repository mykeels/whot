const Deck = require('./deck')
const Card = require("../src/card")
const Shapes = require("../src/shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const logger = require('./logger')('pile.js')

const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')
const LastCardMismatchError = createError('LastCardMismatchError') //to block attempts to play a card that doesn't match the top card in the pile
const NoCardSuppliedError = createError('NoCardSuppliedError') //to block attempts to play no cards

/**
 * 
 * @param {Object} props 
 * @param {EventEmitter} props.emitter
 * 
 * @event pile:push
 * @event pile:reset
 */
const Pile = function (props = {}) {
    if (!props.emitter) {
        logger.warn('props.emitter not defined')
        props.emitter = new EventEmitter()
    }

    /**
     * @type {Card[]}
     */
    const cards = []

    this.top = () => (cards[cards.length - 1] || null)

    this.noOfPlays = 0

    this.firstCardIsWhot = () => ((this.top().shape === Shapes.Whot) && (this.noOfPlays === 1))

    this.push = (_cards_ = []) => {
        if (Array.isArray(_cards_)) {
            if (_cards_.length > 0) {
                const lastCard = _cards_[_cards_.length - 1]
                if (!this.top() || (this.top().matches(lastCard) || this.firstCardIsWhot())) {
                    this.top() && this.top().reset() //reset card to original config (e.g. set iNeed to null)
                    _cards_.forEach(card => cards.push(card))
                    props.emitter.emit('pile:push', _cards_)
                    this.noOfPlays += _cards_.length
                }
                else {
                    throw LastCardMismatchError({ pile: this.top(), play: lastCard })
                }
            }
            else {
                throw NoCardSuppliedError()
            }
        }
        else {
            throw InvalidArgumentTypeError('_cards_', Array)
        }
    }

    this.reset = () => {
        props.emitter.emit('pile:reset', this.top())
        return cards.splice(0, cards.length - 1)
    }
}

module.exports = Pile