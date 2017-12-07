const Card = require("./card");
const Shapes = require("./shapes");

const circles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]
const triangles = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]
const crosses = [1, 2, 3, 5, 7, 10, 11, 13, 14]
const squares = [1, 2, 3, 5, 7, 10, 11, 13, 14]
const stars = [1, 2, 3, 4, 5, 7, 8]
const whots = [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14]

function Deck() {
  this.cards = [];
}
