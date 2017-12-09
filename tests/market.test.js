const { assert } = require('chai')
const Card = require("../src/card")
const Market = require('../src/market')

describe('Market', () => {
    describe('Constructor', () => {
        it('should have cards length = noOfDecks * 54', () => {
            const market = new Market(1)
            assert.equal(market.count(), 54)

            const market2 = new Market(2)
            assert.equal(market2.count(), 108)
        })
    })

    describe('Pick(n)', () => {
        it('should remove (n) cards from the market', () => {
            const market = new Market(1)
            market.pick(2)
            assert.equal(market.count(), 52)
        })

        it('should throw OutOfRangeError if (n) >= .count*()', () => {
            try {
                const market = new Market(1)
                market.pick(55)
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'OutOfRangeError')
            }
        })
    })
})