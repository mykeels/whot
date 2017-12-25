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
        player.play(compatibleCardIndex)
        game.turn.execute(game.pile.top())
    }
    else {
        const marketCards = player.pick()
        game.turn.switch()
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
            const game = new Game({
                noOfDecks: 2,
                noOfPlayers: 4
            })
            let endGame = false
            game.emitter.on('player:play', (player, card) => {
                logger.log(player.render(), '| old:', game.pile.top().render(), '| play:', card.render())
            })
            game.emitter.on('player:market', (player, marketCards) => {
                logger.warn(player.render(), '| old:', game.pile.top().render(), '| market:', marketCards.map(card => card.render()).join(', '))
            })
            logger.warn('Game Start: top:', game.pile.top().render(), ' | ', game.turn.next().render())
            for (let i = 1; i <= 50; i++) {
                if (!endGame) makeRandomPlay(game.turn.next(), game)
            }
        })
    })
    
})

