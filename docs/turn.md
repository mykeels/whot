# Turn

The `Turn` instances regulates the play among the players.

## Properties

`.next()` returns the player whose turn it is to play

`switch(skip)` will change the turn to the next player in the game, and skip a certain number of players if passed as an argument

`execute(topCard)` will perform the necessary action based on the card at the top of the [`pile`](./pile.md)

`setToPick(noOfPlayers, pickCount)` will set a certian number of players to expect to pick a certain number of cards from the market.

`holdon()` will implement the [`holdon` move](./moves.md)

`suspension ()` will implement the [`suspension` move](./moves.md)

`pickTwo()` will implement the [`pick-two` move](./moves.md)

`pickThree()` will implement the [`pick-three` move](./moves.md)

`generalMarket()` will implement the [`general-market` move](./moves.md)

`count()` will return the number of available players