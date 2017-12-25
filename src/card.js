const Shapes = require('./shapes')
const { GetMove } = require('./moves')

/**
 * Generate a new Card, which may be of any shape and value
 * 
 * @param {Object} props
 * @param {Number} props.value
 * @param {Number} props.shape
 * @param {String} props.move
 * @param {String} props.image (optional)
 */

const Card = function (props = {}) {
    this.value = props.value
    this.shape = props.shape
    this.image = props.image
    this.move = GetMove(props.value)
    this.iNeed = props.iNeed
    
    this.matches = (card = new Card()) => {
        return (card.shape === this.shape) || 
                (card.value === this.value) ||
                (this.shape === Shapes.Whot && this.iNeed && this.iNeed === card.shape) ||
                (card.shape === Shapes.Whot && card.iNeed && card.iNeed === this.shape)
    }
    
    this.render = () => `${this.shape} (${this.value})`

    this.reset = () => {
        this.iNeed = null
    }
    
    const self = this;
    Object.assign(this, {
        get score() {
            if (self.shape === Shapes.Star) return self.value * 2
            else return self.value
        }
    })
}

module.exports = Card
module.exports.GetTriangle = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Triangle })))
module.exports.GetCircle = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Circle })))
module.exports.GetSquare = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Square })))
module.exports.GetStar = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Star })))
module.exports.GetWhot = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Whot, value: 20 })))
module.exports.GetCross = (props = {}) => (new Card(Object.assign(Object.assign({}, props), { shape: Shapes.Cross })))