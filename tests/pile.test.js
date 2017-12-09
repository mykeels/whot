const { assert } = require('chai')
const { GetCircle, GetSquare } = require('../src/card')
const Pile = require("../src/pile")

describe('Pile', () => {
    describe('.top()', () => {
        it('should be null initially', () => {
            const pile = new Pile()
            assert.isNull(pile.top())
        })
    })

    describe('.push([...])', () => {
        it('should throw InvalidArgumentTypeError(Array)', () => {
            try {
                const pile = new Pile()
                pile.push({})
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentTypeError')
                assert.equal(err.type.name, 'Array')
            }
        })

        it('should throw NoCardSuppliedError when _cards_[] is empty', () => {
            try {
                const pile = new Pile()
                pile.push([])
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'NoCardSuppliedError')
            }
        })

        it('should throw LastCardMismatchError', () => {
            try {
                const pile = new Pile()
                const card = GetCircle({ value: 1 })
                const card2 = GetSquare({ value: 2 })
                pile.push([card])
                pile.push([card2])
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'LastCardMismatchError')
            }
        })

        it('should work', () => {
            const pile = new Pile()
            const card = GetCircle({ value: 1 })
            pile.push([card])
            assert.deepEqual(pile.top(), card)
        })
    })
})