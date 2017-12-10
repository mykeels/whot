const Shapes = require("./shapes")
const { renderShape } = require('./shapes')
const createError = require('./errors')
const { createTypeError } = require('./errors')
const { eventify } = require('./events')
const EventEmitter = require('events').EventEmitter
const Card = require('./card')
const Pile = require('./pile')
const Market = require('./market')
const Moves = require('./moves')

const util = require('util')
const logger = require('./logger')('player.js')

const CardNotFoundError = createError('CardNotFoundError')
const OutOfTurnError = createError('OutOfTurnError')
const InvalidArgumentError = createError('InvalidArgumentError')
const ExpectedToPickError = createError('ExpectedToPickError')
const PlayValidationFailedError = createError('PlayValidationFailedError')
const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')

/**
 * @param {Object} props
 * @param {Number} props.id identifies the player
 * @param {EventEmitter} props.emitter enables event handling and broadcasting
 * @param {function():Boolean} props.validator checks whether or not the player can play the selected card
 * @param {function():Market} props.market returns a Market instance
 * @param {function():Pile} props.pile return a Pile instance
 * 
 * A player participates in a whot game, by holding and playing a card when it's his/her turn
 * 
 * @event player:play when a card is played by being added to the pile
 * @event player:market when the player goes to market
 */
const Player = function (props) {
    if (!props) throw InvalidArgumentError('props')
    if (!props.id) throw InvalidArgumentError('props.id')
    if (!props.emitter) {
        logger.warn('No EventEmitter supplied')
        props.emitter = new EventEmitter()
    }
    if (!props.market || typeof(props.market) !== 'function') throw InvalidArgumentError('props.market')
    if (!props.pile) logger.warn('No Pile Function supplied')
    else if (typeof(props.pile) !== 'function') throw InvalidArgumentError('props.pile must be a function')

    const validator = (card) => props.pile().top().matches(card)

    /**
     * @type {Card[]}
     */
    const cards = []

    this.id = props.id

    this.turn = false

    this.toPick = 0 //user is expected to pick this number of cards from the market

    this.add = (_cards_ = []) => {
        if (Array.isArray(_cards_)) {
            _cards_.forEach(card => cards.push(card))
            props.emitter.emit('player:add', _cards_)
            this.emit('add', _cards_)
        }
        else {
            throw InvalidArgumentTypeError('_cards_', Array)
        }
    }

    this.hand = () => cards.slice(0)

    this.pick = () => {
        const marketCards = props.market().pick(this.toPick || 1)
        if (!Array.isArray(marketCards)) throw new InvalidArgumentTypeError('marketCards', Array)
        this.add(marketCards)
        this.emit('market', marketCards)
        props.emitter.emit('player:market', this, marketCards)
        this.toPick = 0
        return marketCards
    }

    this.play = (index) => {
        if (this.turn) {
            const card = cards[index]
            if (card) {
                if (this.toPick === 0 || card.shape === Shapes.Whot) {
                    if (validator(card)) {
                        cards.splice(index, 1)
                        this.emit('play', card)
                        props.emitter.emit('player:play', this, card)
                        if (props.pile) props.pile().push([card])
                        if (this.empty()) {
                            if (props.pile().top().move === Moves.None) {
                                props.emitter.emit('player:checkup', this)
                                this.emit('checkup')
                            }
                            else {
                                this.pick()
                            }
                        }
                        if (this.lastCard()) {
                            props.emitter.emit('player:last-card', this)
                            this.emit('last-card')
                        }
                        return card
                    }
                    else if (typeof(props.validator) === 'function' && !props.validator(card)) {
                        throw PlayValidationFailedError(JSON.stringify(card))
                    }
                }
                else {
                    throw ExpectedToPickError(this)
                }
            }
            else {
                throw CardNotFoundError(this)
            }
        }
        else {
            throw OutOfTurnError(this)
        }
    }

    this.lastCard = () => (cards.length === 1)

    this.empty = () => (cards.length === 0)

    this.canPlay = () => ((cards.findIndex(card => card.matches(props.pile().top())) >= 0) && (this.toPick === 0))

    this.render = () => `id: ${this.id} count: ${cards.length} hand: [${cards.map(card => card.value + renderShape(card.shape)).join(',')}]`
    
    eventify(this)
}

module.exports = Player