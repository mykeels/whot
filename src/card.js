const Shapes = require('../shapes')

const Card = function (props = {}) {
    this.value = props.value
    this.shape = props.shape
    this.image = props.image
}

module.exports = Card
module.exports.GetTriangle = (props = {}) => (new Card({ ...props, ...{ shape: Shapes.Triangle }}))
module.exports.GetCircle = (props = {}) => (new Card({ ...props, ...{ shape: Shapes.Circle }}))
module.exports.GetSquare = (props = {}) => (new Card({ ...props, ...{ shape: Shapes.Square }}))
module.exports.GetStar = (props = {}) => (new Card({ ...props, ...{ shape: Shapes.Star }}))
module.exports.GetWhot = (props = {}) => (new Card({ ...props, ...{ shape: Shapes.Whot }}))
module.exports.GetCross = (props = {}) => (new Card({ ...props, ...{ shape: Shapes.Cross }}))