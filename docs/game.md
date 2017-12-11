#Game

The [`index.js`](../src/index.js) returns a function which is a constructor that creates the `Game` instance.

## Properties

`Game.prototype.turn` - instance of `Turn`

`Game.prototype.market` - instance of `Market`

`Game.prototype.pile` - instance of `Pile`

`Game.prototype.emitter` - instance of `EventEmitter` which exposes [events](./events.md) you can subscribe to.