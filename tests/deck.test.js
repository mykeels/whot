const { assert } = require('chai')
const Deck = require('../src/deck')
const Card = require("../src/card");
const Shapes = require("../src/shapes");

describe('Deck', () => {
    const deck = new Deck()

    it('should have cards array', () => {
        assert.isArray(deck.cards)
    })

    describe('Deck.prototype.cards', () => {
        describe('length', () => {
            it('should be 54', () => {
                assert.equal(deck.cards.length, 54)
            })
        })

        describe('shuffle', () => {
            
        })

        it('should have instances of Card', () => {
            deck.cards.forEach(card => assert.instanceOf(card, Card))
        })
    })
})