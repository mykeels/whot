const { renderShape } = require('../src/shapes')
const Shapes = require('../src/shapes')
const { assert } = require('chai')

describe('Shapes', () => {
    describe('Render', () => {
        it('should return c', () => {
            assert.equal(renderShape(Shapes.Circle), 'c')
        })

        it('should return +', () => {
            assert.equal(renderShape(Shapes.Cross), '+')
        })

        it('should return s', () => {
            assert.equal(renderShape(Shapes.Square), 's')
        })

        it('should return *', () => {
            assert.equal(renderShape(Shapes.Star), '*')
        })

        it('should return w', () => {
            assert.equal(renderShape(Shapes.Whot), 'w')
        })

        it('should return t', () => {
            assert.equal(renderShape(Shapes.Triangle), 't')
        })

        it('should return same', () => {
            assert.equal(renderShape('same'), 'same')
        })
    })
})