const { assert } = require('chai')
const Turn = require('../src/turn')
const Player = require('../src/player')
const Market = require('../src/market')
const Pile = require('../src/pile')
const EventEmitter = require('events').EventEmitter

describe('Turn', () => {
    const pile = new Pile()
    const market = new Market({ noOfDecks: 1, pile })

    const player1 = new Player({ id: 1, emitter: new EventEmitter(), validator: () => true, market: () => market })
    const player2 = new Player({ id: 2, emitter: new EventEmitter(), validator: () => true, market: () => market })
    const player3 = new Player({ id: 3, emitter: new EventEmitter(), validator: () => true, market: () => market })

    const players = [
        player1, player2, player3
    ]

    describe('Constructor', () => {
        
        it('should throw InvalidArgumentTypeError if _player_ is not Array', () => {
            try {
                const turn = new Turn()
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentTypeError')
            }
        })
        
        it('should create props emitter if NOT defined', () => {
            const props = {
                players
            }
            const turn = new Turn(props)
            assert.isDefined(props.emitter)
        })

        it('should throw PlayersNotEnoughError if props.players.length === 0', () => {
            try {
                const turn = new Turn({
                    players: [],
                    emitter: new EventEmitter()
                })
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'PlayersNotEnoughError')
            }
        })

        it('should work', () => {
            const turn = new Turn({
                players: [
                    player1,
                    player2,
                    player3
                ],
                emitter: new EventEmitter()
            })
        })
    })

    describe('.next()', () => {
        const turn = new Turn({
            players: [
                player1,
                player2,
                player3
            ],
            emitter: new EventEmitter()
        })

        it('should have a value which is equal to player1', () => {
            assert.deepEqual(turn.next(), player1)
        })
    })

    describe('.switch(skip).next()', () => {
        it('should equal player2', () => {
            const turn = new Turn({
                players: [
                    player1,
                    player2,
                    player3
                ],
                emitter: new EventEmitter()
            })
            turn.switch()
            assert.deepEqual(turn.next(), player2)
        })

        it('should equal player3', () => {
            const turn = new Turn({
                players: [
                    player1,
                    player2,
                    player3
                ],
                emitter: new EventEmitter()
            })
            turn.switch(1)
            assert.deepEqual(turn.next(), player3)
        })
    })

    describe('.setToPick(n, count)', () => {
        it('should have player2.toPick === 2', () => {
            const turn = new Turn({
                players: [
                    player1,
                    player2,
                    player3
                ],
                emitter: new EventEmitter()
            })
            turn.setToPick(1, 2)
            assert.equal(player1.toPick, 0)
            assert.equal(player2.toPick, 2)
            assert.equal(player3.toPick, 0)
        })

        it('should have && player2.toPick === 1 && player3.toPick === 1', () => {
            const turn = new Turn({
                players: [
                    player1,
                    player2,
                    player3
                ],
                emitter: new EventEmitter()
            })
            turn.setToPick(2, 1)
            assert.equal(player1.toPick, 0)
            assert.equal(player2.toPick, 1)
            assert.equal(player3.toPick, 1)
        })
    })    

    describe('.holdon()', () => {
        it('should make the same player the value of .next()', () => {
            const turn = new Turn({
                players: [
                    player1,
                    player2,
                    player3
                ],
                emitter: new EventEmitter()
            })
            turn.holdon()
            assert.deepEqual(turn.next(), player1)
        })
    })

    describe('.pickTwo()', () => {
        it('should have player2.toPick === 2', () => {
            const turn = new Turn({
                players: [
                    player1,
                    player2,
                    player3
                ],
                emitter: new EventEmitter()
            })
            turn.pickTwo()
            assert.equal(player2.toPick, 2)
        })

        describe('defer', () => {
            it('should have player3.toPick === 4', () => {
                const turn = new Turn({
                    players: [
                        player1,
                        player2,
                        player3
                    ],
                    emitter: new EventEmitter()
                })
                turn.pickTwo()
                turn.pickTwo()
                assert.equal(player1.toPick, 0)
                assert.equal(player2.toPick, 0)
                assert.equal(player3.toPick, 4)
            })

            describe('.pickTwo().switch().pickThree()', () => {
                it('should throw InappropriateMoveError', () => {
                    try {
                        const turn = new Turn({
                            players: [
                                player1,
                                player2,
                                player3
                            ],
                            emitter: new EventEmitter()
                        })
                        turn.pickTwo()
                        turn.pickThree()
                        assert.fail()
                    }
                    catch (err) {
                        assert.equal(err.name, 'InappropriateMoveError')
                        assert.equal(err.message, 'pickThree')
                    }
                })
            })
            
            
        })

        describe('.pickThree()', () => {
            it('should have .next().toPick === 3', () => {
                const turn = new Turn({
                    players: [
                        player1,
                        player2,
                        player3
                    ],
                    emitter: new EventEmitter()
                })
                turn.pickThree()
                assert.equal(player2.toPick, 3)
            })

            describe('defer', () => {
                it('should have player3.toPick === 6', () => {
                    const turn = new Turn({
                        players: [
                            player1,
                            player2,
                            player3
                        ],
                        emitter: new EventEmitter()
                    })
                    turn.pickThree()
                    turn.pickThree()
                    assert.equal(player1.toPick, 0)
                    assert.equal(player2.toPick, 0)
                    assert.equal(player3.toPick, 6)
                })

                describe('.pickThree().switch().pickTwo()', () => {
                    it('should throw InappropriateMoveError', () => {
                        try {
                            const turn = new Turn({
                                players: [
                                    player1,
                                    player2,
                                    player3
                                ],
                                emitter: new EventEmitter()
                            })
                            turn.pickThree()
                            turn.pickTwo()
                            assert.fail()
                        }
                        catch (err) {
                            assert.equal(err.name, 'InappropriateMoveError')
                            assert.equal(err.message, 'pickTwo')
                        }
                    })
                })
            })
        })

        describe('.suspension()', () => {
            it('should have .next() === player3', () => {
                const turn = new Turn({
                    players: [
                        player1,
                        player2,
                        player3
                    ],
                    emitter: new EventEmitter()
                })
                turn.suspension()
                assert.deepEqual(turn.next(), player3)
            })

            describe('isStar = true', () => {
                it('should have .next() === player1', () => {
                    const turn = new Turn({
                        players: [
                            player1,
                            player2,
                            player3
                        ],
                        emitter: new EventEmitter()
                    })
                    turn.suspension(true)
                    assert.deepEqual(turn.next(), player1)
                })
            })
        })

        describe('.count()', () => {
            it('should be 3', () => {
                const turn = new Turn({
                    players: [
                        player1,
                        player2,
                        player3
                    ],
                    emitter: new EventEmitter()
                })
                assert.equal(turn.count(), 3)
            })
        })

        describe('.all(fn)', () => {
            it('should be 3', () => {
                const turn = new Turn({
                    players: [
                        player1,
                        player2,
                        player3
                    ],
                    emitter: new EventEmitter()
                })
                assert.equal(turn.all(), 3)
            })
        })
    })
})