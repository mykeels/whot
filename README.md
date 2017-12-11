# Whot! (IN DEVELOPMENT)

Whot! is the national card game of Nigeria. It is played by young and old, and has come to be associated with fond memories, by me and a lot of people I know. [Read More](https://www.pagat.com/com/whot.html)

This is a JS Library that will facilitate the Nigerian Whot! Game Play.

## Why

I am starting this project because I know it will be challenging (I look forward to it), and because I hope someone else builds a beautiful UI/UX around it (cos I can't), so I can play this game with my friends and family from my phone and laptop, and experience the same amount of fun I did playing it as a child.

## How

```bash
npm install whot
```

```js
const Game = require('whot')

const game = new Game({
    noOfDecks: 1, //number of card decks to be used
    noOfPlayers: 4
})
```

To make a play:

```js
const player = game.turn.next()

if (player.canPlay()) {
    /** pick a random card from the player's hand */
    const compatibleCardIndex = player.hand()
                                .findIndex(card => card.matches(game.pile.top()))
    const card = player.hand()[compatibleCardIndex]
    player.play(compatibleCardIndex)
    game.turn.execute(game.pile.top())
}
else {
    const marketCards = player.pick()
    game.turn.switch()
}
```

You can subscribe to the events that the [`Game`](./docs/game.md) instance offers via its `emitter` property. [Read More](./docs/events.md)

See more in the [docs](./docs)

### Testing

- See [test suite](./tests)

- Run `npm test`

## Who

It'll be me, unless you can convince me you are interested

## When

ASAP!