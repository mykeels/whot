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
        assert.equal(circle.score, 1)
    })
    
    describe('star', () => {
        it('should have a double score', () => {
            const star = GetStar({
                value: 1
            })
            assert.equal(star.score, 2)
        })
    })
})