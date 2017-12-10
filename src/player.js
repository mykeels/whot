const Shapes = require("./shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter
const Card = require('./card')

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
 * @param {Function} props.validator checks whether or not the player can play the selected card
 * @param {Function} props.market returns a Market instance
 * 
 * A player participates in a whot game, by holding and playing a card when it's his/her turn
 * 
 * @event player:play when a card is played
 * @event player:market when the player goes to market
 */
const Player = function (props) {
    if (!props) throw InvalidArgumentError('props')
    if (!props.id) throw InvalidArgumentError('props.id')
    if (!props.emitter) {
        logger.warn('No EventEmitter supplied')
        props.emitter = new EventEmitter()
    }
    if (!props.validator) logger.warn('No Validator Function supplied')
    else if (typeof(props.validator) !== 'function') throw InvalidArgumentError('props.validator must be a function')
    if (!props.market || typeof(props.market) !== 'function') throw InvalidArgumentError('props.market')

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
        }
        else {
            throw InvalidArgumentTypeError('_cards_', Array)
        }
    }

    this.hand = () => cards.slice(0)

    this.pick = () => {
        const marketCards = props.market().pick(this.toPick)
        if (!Array.isArray(marketCards)) throw new InvalidArgumentTypeError('marketCards', Array)
        props.emitter.emit('player:market', this, marketCards)
        this.add(marketCards)
        this.toPick = 0
    }

    this.play = (index) => {
        if (this.turn) {
            if (this.toPick === 0) {
                const card = cards[index]
                if (card) {
                    if (!props.validator || (typeof(props.validator) === 'function' && props.validator(card))) {
                        cards.splice(index, 1)
                        props.emitter.emit('player:play', this, card)
                        this.emit('play', card)
                        if (this.empty()) {
                            props.emitter.emit('player:checkup', this)
                            this.emit('checkup')
                        }
                        if (this.lastCard()) {
                            props.emitter.emit('player:last-card', this)
                            this.emit('last-card')
                        }
                        return card
                    }
                    else if (typeof(props.validator) === 'function' && !props.validator(card)) {
                        throw PlayValidationFailedError(card)
                    }
                    else {
                        throw InvalidArgumentError('props.validator')
                    }
                }
                else {
                    throw CardNotFoundError(this)
                }
            }
            else {
                throw ExpectedToPickError(this)
            }
        }
        else {
            throw OutOfTurnError(this)
        }
    }

    this.lastCard = () => (cards.length === 1)

    this.empty = () => (cards.length === 0)
}

Object.assign(Player.prototype, EventEmitter.prototype)

module.exports = Player