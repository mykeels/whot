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
    
    describe('Star', () => {
        it('should have a double score', () => {
            const star = GetStar({
                value: 1
            })
            assert.equal(star.score, 2)
        })
    })

    describe('.matches()', () => {
        it('should be false if cards have different shapes', () => {
            assert.isFalse((GetSquare({ value: 1 }).matches(GetCircle({ value: 8 }))))
        })

        it('should be true if cards have different shapes but same value', () => {
            assert.isTrue((GetSquare({ value: 1 }).matches(GetCircle({ value: 1 }))))
        })

        it('should be true if cards have same shape but different values', () => {
            assert.isTrue((GetCircle({ value: 1 }).matches(GetCircle({ value: 8 }))))
        })
        
        it('should be true if cards have same shape and same values', () => {
            assert.isTrue((GetCircle({ value: 1 }).matches(GetCircle({ value: 1 }))))
        })

        it('should be true if either card is whot', () => {
            assert.isTrue((GetCircle({ value: 1 }).matches(GetWhot({ iNeed: Shapes.Circle }))))
            assert.isTrue((GetWhot({ iNeed: Shapes.Square }).matches(GetSquare({ value: 2 }))))
        })
    })
})