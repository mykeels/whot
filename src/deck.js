const Card = require("./card")
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

function Deck() {
  this.cards = [].concat(circles.map(value => (GetCircle({ value }))))
                .concat(triangles.map(value => (GetTriangle({ value }))))
                .concat(crosses.map(value => (GetCross({ value }))))
                .concat(squares.map(value => (GetSquare({ value }))))
                .concat(stars.map(value => (GetStar({ value }))))
                .concat(whots.map(value => (GetWhot({ value }))))

  this.shuffle = () => {
      return this.cards.map((card, index) => index).sort((a, b) => Math.random() - 0.5).map(index => this.cards[index])
  }
}

module.exports = Deck