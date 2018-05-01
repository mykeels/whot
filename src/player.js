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
const CardNeededUndefinedError = createTypeError('CardNeededUndefinedError')

/**
 * @param {Object} props
 * @param {Number} props.id identifies the player
 * @param {EventEmitter} props.emitter enables event handling and broadcasting
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

    /**
     * 
     * @param {Card} card 
     * checks that it is possible to play a card
     * 
     * condition is true if:
     *   - card matches card at the top of the pile
     *   - top pile card is a Whot!, and is the first card in the game
     */
    const validator = (card) => (props.pile().top().matches(card) || props.pile().firstCardIsWhot())

    /**
     * @type {Card[]}
     */
    const cards = []

    this.id = props.id

    this.turn = false

    this.toPick = 0 //user is expected to pick this number of cards from the market

    /**
     * @param {Card[]} _cards_
     */
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

    /**
     * @return {Card[]}
     */
    this.hand = () => cards.slice(0)

    /**
     * @return {Card[]}
     */
    this.pick = () => {
        const marketCards = props.market().pick(this.toPick || 1)
        if (!Array.isArray(marketCards)) throw new InvalidArgumentTypeError('marketCards', Array)
        this.add(marketCards)
        this.emit('market', marketCards)
        props.emitter.emit('player:market', this, marketCards)
        this.toPick = 0
        return marketCards
    }

    /**
     * @param {Number} index position of card in player.hand() to play
     * @param {String} iNeed shape that Whot card takes for (i need)
     */
    this.play = (index, iNeed) => {
        if (this.turn) {
            const card = cards[index]
            if (card) {
                if (this.toPick === 0 || card.shape === Shapes.Whot) {
                    if (card.shape === Shapes.Whot) {
                        if (!iNeed) throw CardNeededUndefinedError()
                        else card.iNeed = iNeed
                    }
                    if (validator(card)) {
                        cards.splice(index, 1)
                        this.emit('play', card)
                        props.emitter.emit('player:play', this, card)
                        if (props.pile) {
                            props.pile().push([card])
                        }
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
                    else {
                        throw PlayValidationFailedError(JSON.stringify({ top: props.pile().top(), card }))
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

    this.canMatchMove = (move) => (cards.findIndex(card => card.move === (move || props.pile().top().move)) >= 0)

    this.render = () => `id: ${this.id} count: ${cards.length} hand: [${cards.map(card => card.value + renderShape(card.shape)).join(',')}]`
    
    eventify(this)
}

module.exports = Player