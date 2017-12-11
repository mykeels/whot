# Whot!

Whot! is the national card game of Nigeria. It is played by young and old, and has come to be associated with fond memories, by me and a lot of people I know. [Read More](https://www.pagat.com/com/whot.html)

This is a JS Library that will facilitate the Nigerian Whot! Game Play.

## Why

I have started this project because I hope someone else builds a beautiful UI/UX around it (cos I can't).

I also want to play this game with my friends and family from my phone and laptop, and experience the same amount of fun I did playing it as a child.

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

You can subscribe to the [events](./docs/events.md) that the [`Game`](./docs/game.md) instance offers via its `emitter` property.

Read more in [docs](./docs)

### Testing

- See [test suite](./tests)

- Run `npm test`

## Who

It'll be me, unless you can convince me you are interested

## When

On-going! Now on version 1.0.0 😀