# Game Events

Every event can be subscribed to via the `Game.prototype.emitter` object e.g. 

```
const game = new Game({ noOfDecks: 1, noOfPlayers: 4 })
game.emitter.on('player:play', (card) => {
    console.log(card)
})
```

| Name | Origin | Parameters | Trigger |
| ---- |:------:| :---------:| -------: |
| deck:create | [deck.js](../src/deck.js) | cards:Array | when a card deck is created |
| deck:shuffle |  | cards:Array | when a card deck is shuffled |
| market:create | [market.js](../src/market.js) | cards:Array | when a market is created |
| market:pick |   | cards:Array | when a player picks cards |
| pile:push | [pile.js](../src/pile.js)  | cards:Array | when a player plays some card(s) |
| pile:reset |   | card:Card | when the market is refilled from the pile |
| player:play | [player.js](../src/player.js)  | player:Player, card:Card | when a player plays a card |
| player:market |   | player:Player, cards:Array | when a player goes to the market |
| player:checkup |   | player:Player | when a player wins |
| player:last-card |   | player:Player | when a player has one card left |
| player:add |   | cards:Array | when a player has cards added to his/her hand |
| turn:switch | [turn.js](../src/turn.js) | skip:Number, player:Player | when it's a new turn |
| turn:holdon |  | skippedPlayers:Array | when a player plays holdon |
| turn:pick-two |  | affectedPlayer:Player | when a player plays [pick-two](./moves.md) |
| turn:pick-three |  | affectedPlayer:Player | when a player plays [pick-three](./moves.md) |
| turn:suspension |  |  skippedPlayers:Array | when a player plays [suspension](./moves.md) |
| turn:general-market |  | affectedPlayers:Array | when a player plays [general-market](./moves.md) |