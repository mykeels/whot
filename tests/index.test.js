const { assert } = require('chai')
const Player = require('../src/player')
const Market = require('../src/market')
const Game = require('../src')
const logger = require('../src/logger')('index.test.js')

/**
 * 
 * @param {Player} player 
 * @param {Game} game
 */
const makeRandomPlay = (player, game) => {
    if (player.canPlay()) {
        const compatibleCardIndex = player.hand().findIndex(card => card.matches(game.pile.top()))
        const card = player.hand()[compatibleCardIndex]
        logger.log('old:', card.render(), 'new:', game.pile.top().render())
        player.play(compatibleCardIndex)
        return card
    }
    else {
        player.pick()
    }
}

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
            for (let i = 1; i <= 50; i++) {
                const game = new Game({
                    noOfDecks: 1,
                    noOfPlayers: 4
                })
            
                makeRandomPlay(game.turn.next(), game)
            }
        })
    })
    
})

