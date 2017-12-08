const EventEmitter = require('events').EventEmitter

const Events = new EventEmitter()

module.exports = Events

module.exports.EventEmitter = EventEmitter

module.exports.raiseEvent = (name, callback, ...args) => {
    callback(...args)
    Events.emit(name, ...args)   
}