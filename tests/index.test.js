const { assert } = require('chai')
const Game = require('../src')

describe('Game', () => {
    describe('Constructor', () => {
        it('should throw InvalidArgumentTypeError', () => {
            try {
                const game = new Game()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentTypeError')
                assert.equal(err.message, 'props.noOfPlayers')
            }
        })

        it('should work', () => {
            const game = new Game({
                noOfDecks: 1,
                noOfPlayers: 4
            })
        })
    })
    
})