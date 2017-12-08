const Shapes = require("./shapes")
const createError = require('./errors')

const CardNotFoundError = createError('CardNotFoundError')

/**
 * A player participates in a whot game, by holding and playing a card when it's his/her turn
 */
const Player = function (id) {
    const cards = []

    this.id = id

    this.turn = false;

    this.add = (_cards_ = []) => {
        if (Array.isArray(_cards_)) {
            cards = cards.concat(_cards_)
        }
    }

    this.hand = () => cards.slice(0)
    
    this.play = (index) => {
        const card = cards[index]
        if (card) {
            cards.splice(index, 1)
            return card
        }
        else {
            throw new CardNotFoundError(this)
        }
    }
}