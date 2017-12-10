const Card = require("./card")
const logger = require('./logger')('deck.js')
const EventEmitter = require('events').EventEmitter
const {
    GetCircle,
    GetStar,
    GetSquare,
    GetCross,
    GetTriangle,
    GetWhot
} = require("./card")

const Shapes = require("./shapes")

const circles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]
const triangles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]
const crosses = [1, 2, 3, 5, 7, 10, 11, 13, 14]
const squares = [1, 2, 3, 5, 7, 10, 11, 13, 14]
const stars = [1, 2, 3, 4, 5, 7, 8]
const whots = [20, 20, 20, 20, 20]

/**
 * @param {Object} props
 * @param {EventEmitter} props.emitter
 * 
 * @event deck:create
 * @event deck:shuffle
 */
function Deck(props = {}) {
    if (!props.emitter) {
        logger.warn('props.emitter not defined')
        props.emitter = new EventEmitter()
    }

    this.cards = [].concat(circles.map(value => (GetCircle({ value }))))
                .concat(triangles.map(value => (GetTriangle({ value }))))
                .concat(crosses.map(value => (GetCross({ value }))))
                .concat(squares.map(value => (GetSquare({ value }))))
                .concat(stars.map(value => (GetStar({ value }))))
                .concat(whots.map(value => (GetWhot({ value }))))

    props.emitter.emit('deck:create', this.cards)

    this.shuffle = () => {
        const cards = this.cards.map((card, index) => index).sort((a, b) => Math.random() - 0.5).map(index => this.cards[index])
        props.emitter.emit('deck:shuffle', cards)
        return cards
    }
}

module.exports = Deck