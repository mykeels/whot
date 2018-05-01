const { assert } = require('chai')
const Player = require('../src/player')
const Pile = require('../src/pile')
const Market = require('../src/market')
const Moves = require('../src/moves')
const Shapes = require('../src/shapes')
const { GetCircle, GetSquare, GetWhot } = require('../src/card')
const EventEmitter = require('events').EventEmitter

const emitter = new EventEmitter()
const pile = new Pile({ emitter })
pile.push([ GetCircle({ value: 3 }) ])
const market = new Market({ noOfDecks: 1, pile, emitter })
const mockMarket = () => market
const mockPile = () => pile

describe('Player', () => {
    describe('Constructor', () => {
        it('should throw InvalidArgumentError if props argument is not supplied', () => {
            try {
                const player = new Player()
                
                //ensure it doesn't get here
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentError')
                assert.equal(err.message, 'props')
            }
        })

        it('should throw InvalidArgumentError if props.id argument is not supplied', () => {
            try {
                const player = new Player({})
                
                //ensure it doesn't get here
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentError')
                assert.equal(err.message, 'props.id')
            }
        })
        
        it('should throw InvalidArgumentError if props.market argument is either not supplied, or is supplied but is not a function', () => {
            try {
                const player = new Player({ 
                    id: 1, 
                    validator: (card) => true,
                    emitter: {}
                })

                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentError')
                assert.equal(err.message, 'props.market')
            }

            try {
                const player = new Player({ 
                    id: 1, 
                    validator: (card) => true,
                    emitter: {},
                    market: {}
                })
                
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentError')
                assert.equal(err.message, 'props.market')
            }
        })
        
        it('should work when appropriate values are passed', () => {
            const player = new Player({ 
                id: 1, 
                validator: (card) => true,
                emitter: {},
                market: mockMarket,
                pile: mockPile
            })
        })
        
        it('should initialise emitter when not supplied in prop', () => {
            const props = { 
                id: 1, 
                validator: (card) => true,
                market: mockMarket,
                pile: mockPile
            }
            assert.isUndefined(props.emitter)
            const player = new Player(props)
            assert.isDefined(props.emitter)
        })
    })

    describe('Cards', () => {
        const player = new Player({ 
            id: 1, 
            emitter: new EventEmitter(),
            market: mockMarket,
            pile: mockPile
        })
        describe('Count', () => {
            it('should initially be 0', () => {
                assert.equal(player.hand.length, 0)
            })
        })

        describe('Add', () => {
            it('should throw InvalidArgumentTypeError(Array) if invalid argument is supplied', () => {
                try {
                    player.add({})
                    
                    //ensure it doesn't get here
                    assert.fail()
                }
                catch (err) {
                    assert.equal(err.name, 'InvalidArgumentTypeError')
                    assert.equal(err.type, Array)
                }
            })

            it('should add expected number of cards if supplied', () => {
                player.add([{}, {}, {}])
                assert.equal(player.hand().length, 3)
            })
        })

        describe('Move', () => {
            it('can match PickThree move', () => {
                const player = new Player({ 
                    id: 1, 
                    emitter: new EventEmitter(),
                    market: mockMarket,
                    pile: () => ({
                        top: () => ({ move: Moves.PickThree })
                    })
                })

                player.add([
                    { move: null },
                    { move: null },
                    { move: Moves.PickThree },
                ])

                assert.isTrue(player.canMatchMove())
            })

            it('can NOT match move', () => {
                const player = new Player({ 
                    id: 1, 
                    emitter: new EventEmitter(),
                    market: mockMarket,
                    pile: () => ({
                        top: () => ({ move: Moves.PickThree })
                    })
                })

                player.add([
                    { move: null },
                    { move: null },
                    { move: null },
                ])

                assert.isFalse(player.canMatchMove())
            })
        })

        describe('Play', () => {
            it('should throw OutOfTurnError if not in turn', () => {
                try {
                    player.play(0)

                    //ensure it doesn't get here
                    assert.fail()
                }
                catch (err) {
                    assert.equal(err.name, 'OutOfTurnError')
                }
            })

            it('should throw CardNotFoundError if card index cannot be found', () => {
                try {
                    player.turn = true
                    player.play(-1)

                    //ensure it doesn't get here
                    assert.fail()
                }
                catch (err) {
                    assert.equal(err.name, 'CardNotFoundError')
                }
            })
            
            it('should work', () => {
                let somePlayer = new Player({ 
                    id: 1, 
                    validator: (card) => true,
                    emitter: new EventEmitter(),
                    market: mockMarket,
                    pile: mockPile
                })
                const card1 = GetCircle({ value: 4 })
                const card2 = GetSquare({ value: 2 })
                somePlayer.turn = true
                somePlayer.add([card1, card2])
                assert.equal(somePlayer.hand().length, 2)
                somePlayer.play(0)
                assert.equal(somePlayer.hand().length, 1)
            })
            
            it('should reach checkup', () => {
                let somePlayer = new Player({ 
                    id: 1, 
                    validator: (card) => true,
                    emitter: new EventEmitter(),
                    market: mockMarket,
                    pile: mockPile
                })
                const card1 = GetCircle({ value: 4 })
                somePlayer.turn = true
                somePlayer.add([card1])
                assert.equal(somePlayer.hand().length, 1)
                somePlayer.play(0)
                assert.equal(somePlayer.hand().length, 0)
                assert.isTrue(somePlayer.hasWon)
            })
            
            it('should pick from market and NOT reach checkup', () => {
                let somePlayer = new Player({ 
                    id: 1, 
                    validator: (card) => true,
                    emitter: new EventEmitter(),
                    market: mockMarket,
                    pile: mockPile
                })
                const card1 = GetCircle({ value: 5 })
                somePlayer.turn = true
                somePlayer.add([card1])
                assert.equal(somePlayer.hand().length, 1)
                somePlayer.play(0)
                assert.equal(somePlayer.hand().length, 1)
                assert.isFalse(somePlayer.hasWon)
            })
            
            it('should play iNeed', () => {
                let somePlayer = new Player({ 
                    id: 1, 
                    validator: (card) => true,
                    emitter: new EventEmitter(),
                    market: mockMarket,
                    pile: mockPile
                })
                const card1 = GetWhot({  })
                const card2 = GetCircle({ value: 6 })
                somePlayer.turn = true
                somePlayer.add([card1, card2])
                somePlayer.play(0, Shapes.Circle)
                assert.equal(pile.top().shape, Shapes.Whot)
                assert.equal(pile.top().iNeed, Shapes.Circle)
            })
            
            it('should throw PlayValidationFailedError', () => {
                try {
                    let somePlayer = new Player({ 
                        id: 1, 
                        validator: (card) => true,
                        emitter: new EventEmitter(),
                        market: mockMarket,
                        pile: mockPile
                    })
                    const card1 = GetSquare({ value: 6 })
                    somePlayer.turn = true
                    somePlayer.add([card1])
                    somePlayer.play(0)
                    assert.fail()
                }
                catch (err) {
                    assert.equal(err.name, 'PlayValidationFailedError')
                }
            })
            
            it('should throw ExpectedToPickError', () => {
                try {
                    let somePlayer = new Player({ 
                        id: 1, 
                        validator: (card) => true,
                        emitter: new EventEmitter(),
                        market: mockMarket,
                        pile: mockPile
                    })
                    const card1 = GetCircle({ value: 2 })
                    const card2 = GetCircle({ value: 6 })
                    somePlayer.turn = true
                    somePlayer.add([card1, card2])
                    somePlayer.play(0)
                    somePlayer.toPick = 2
                    somePlayer.play(0)
                    assert.fail()
                }
                catch (err) {
                    assert.equal(err.name, 'ExpectedToPickError')
                }
            })
        })
    })
})