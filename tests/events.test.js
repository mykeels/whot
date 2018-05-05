const { eventify, raiseEvent } = require('../src/events')

const Events = require('../src/events')

const { assert } = require('chai')


describe('Eventify', () => {
    

    it('should have appropriate functions', () => {
        const target = eventify({})
        assert.isFunction(target.once)
        assert.isFunction(target.on)
        assert.isFunction(target.removeListener)
        assert.isFunction(target.emit)
    })

    describe('.on()', () => {
        it('should create an array in events', () => {
            const target = eventify({})
            target.on('custom:name', () => ({}))
            assert.isArray(target.events['custom:name'])
        })
        
        it('should add to array in events', () => {
            const target = eventify({})
            target.on('custom:name', () => ({}))
            target.on('custom:name', () => ({}))
            assert.equal(target.events['custom:name'].length, 2)
        })
    })

    describe('.emit()', () => {
        let value = false
        it('should change value to true', () => {
            const target = eventify({})

            target.on('value:toggle', () => {
                value = true
            })

            target.emit('value:toggle')

            assert.isTrue(value)
        })
    })

    describe('.removeListener()', () => {
        it('should have event count as zero', () => {
            const target = eventify({})
            const listener = () => ({})
            target.on('custom:name', listener)
            assert.equal(target.events['custom:name'].length, 1)

            target.removeListener('custom:name', listener)
            assert.equal(target.events['custom:name'].length, 0)
        })
    })

    describe('.once()', () => {
        it('should always have events count as 1', () => {
            const target = eventify({})
            const listener = () => ({})
            target.once('custom:name', listener)
            assert.equal(target.events['custom:name'].length, 1)

            target.emit('custom:name')
            assert.equal(target.events['custom:name'].length, 0)
        })
    })
})

describe('RaiseEvents', () => {
    let value = false

    it('should change value to true', () => {
        Events.on('value:toggle', () => {
            value = true
        })

        raiseEvent('value:toggle')

        assert.isTrue(value)
    })
})