const Shapes = require("./shapes")
const createError = require('./errors')
const { createTypeError } = require('./errors')
const EventEmitter = require('events').EventEmitter

const logger = require('./logger')('player.js')

const CardNotFoundError = createError('CardNotFoundError')
const OutOfTurnError = createError('OutOfTurnError')
const InvalidArgumentError = createError('InvalidArgumentError')
const PlayValidationFailedError = createError('PlayValidationFailedError')
const InvalidArgumentTypeError = createTypeError('InvalidArgumentTypeError')


/**
 * @param {Object} props
 * @param {Number} props.id identifies the player
 * @param {EventEmitter} props.emitter enables event handling and broadcasting
 * @param {Function} props.validator checks whether or not the player can play the selected card
 * 
 * A player participates in a whot game, by holding and playing a card when it's his/her turn
 * 
 * @event player:play
 */
const Player = function (props) {
    if (!props) throw InvalidArgumentError('props')
    if (!props.id) throw InvalidArgumentError('props.id')
    if (!props.emitter) logger.warn('No EventEmitter supplied')
    if (!props.validator) logger.warn('No Validator Function supplied')
    else if (typeof(props.validator) !== 'function') throw InvalidArgumentError('props.validator must be a function')

    props.emitter = props.emitter || new EventEmitter()

    const cards = []

    this.id = props.id

    this.turn = false;

    this.add = (_cards_ = []) => {
        if (Array.isArray(_cards_)) {
            _cards_.forEach(card => cards.push(card))
        }
        else {
            throw InvalidArgumentTypeError('_cards_', Array)
        }
    }

    this.hand = () => cards.slice(0)

    this.play = (index) => {
        if (this.turn) {
            const card = cards[index]
            if (card) {
                if (!props.validator || (typeof(props.validator) === 'function' && props.validator(card))) {
                    cards.splice(index, 1)
                    props.emitter.emit('player:play', this.id, card)
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
            throw OutOfTurnError(this)
        }
    }
}

module.exports = Player