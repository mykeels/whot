# Player

The `Player` is a represents a player in the game, and has the following properties

## Properties

1. `player.canPlay()` tells you if the player is eligible to play i.e. hasn't been blocked by a move like pick-two or hold-on, and whether the player has a card compatible with the card at the top of the pile.

2. `player.toPick` is a `Number`, which tells how many cards the player is expected to pick.

3. `player.pick()` makes the player go to market to get `(toPick || 1)` cards from the top of the pile.

4. `player.hand()` get a copy of the cards the player holds

5. `player.turn` says whether or not it's the player's turn

6. `player.lastCard()` says whether or not the player has one card left

7. `player.empty()` is `true`, if the player has no cards left

8. `player.canPlay()` is `true`, if the player is in turn, and has a card that is compatible with the card at the top of the deck