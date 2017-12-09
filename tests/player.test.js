const { assert } = require('chai')
const Player = require('../src/player')
const EventEmitter = require('events').EventEmitter

const mockMarket = () => { pick: (num = 0) => (new Array(0)) }

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

        it('should throw InvalidArgumentError if props.valid argument is supplied but is not a function', () => {
            try {
                const player = new Player({ id: 1, validator: {}, emitter: {} })
                
                //ensure it doesn't get here
                assert.fail()
            }
            catch (err) {
                assert.equal(err.name, 'InvalidArgumentError')
                assert.isTrue(err.message.indexOf('props.validator') >= 0)
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
                market: mockMarket
            })
        })
    })

    describe('Cards', () => {
        const player = new Player({ 
            id: 1, 
            validator: (card) => false,
            emitter: {},
            market: mockMarket
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
            
            it('should throw PlayValidationFailedError if supplied validation function fails index cannot be found', () => {
                try {
                    player.turn = true
                    player.play(0)

                    //ensure it doesn't get here
                    assert.fail()
                }
                catch (err) {
                    assert.equal(err.name, 'PlayValidationFailedError')
                }
            })
            
            it('should work', () => {
                let somePlayer = new Player({ 
                    id: 1, 
                    validator: (card) => true,
                    emitter: new EventEmitter(),
                    market: mockMarket
                })
                somePlayer.turn = true
                somePlayer.add([{}, {}])
                assert.equal(somePlayer.hand().length, 2)
                somePlayer.play(0)
                assert.equal(somePlayer.hand().length, 1)
            })
        })
    })
})