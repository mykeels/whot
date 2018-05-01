const { assert } = require('chai')
const emitter = require('../src/events')
const Card = require("../src/card")
const Pile = require("../src/pile")
const Market = require('../src/market')

describe('Market', () => {
    describe('Constructor', () => {
        it('should have cards length = noOfDecks * 54', () => {
            const market = new Market({ noOfDecks: 1, emitter })
            assert.equal(market.count(), 54)

            const market2 = new Market({ noOfDecks: 2, emitter })
            assert.equal(market2.count(), 108)
        })
    })

    describe('Pick(n)', () => {
        it('should remove (n) cards from the market', () => {
            const market = new Market({ noOfDecks: 1, emitter })
            const pickedCards = market.pick(2)
            assert.equal(pickedCards.length, 2)
            assert.equal(market.count(), 52)
        })

        it('should throw PropNotFoundError because pile() not provided', () => {
            try {
                const market = new Market({ noOfDecks: 1, emitter })
                market.pick(55)
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'PropNotFoundError')
            }
        })

        it('should throw OutOfRangeError if (n) >= .count*()', () => {
            try {
                const pile = () => (new Pile({ emitter }))
                const market = new Market({ noOfDecks: 1, emitter, pile })
                const pickedCards = market.pick(55)
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'OutOfRangeError')
            }
        })
    })
})