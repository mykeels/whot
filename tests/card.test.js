const { assert } = require('chai')
const Card = require("../src/card")
const {
    GetCircle,
    GetStar,
    GetSquare,
    GetCross,
    GetTriangle,
    GetWhot
} = require("../src/card")

const Shapes = require("../src/shapes")

describe('Card', () => {
    it('should have a score', () => {
        const circle = GetCircle({
            value: 1
        })
        console.log(circle)
        assert.equal(circle.score, 1)
    })
})