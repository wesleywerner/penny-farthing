/**
    This file is part of Penny Farthing.

    Penny Farthing is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Penny Farthing is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Penny Farthing.  If not, see <http://www.gnu.org/licenses/>.
  */
  
/**
 * A functional library that offers handling a deck of cards.
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var deck = g.deck = { }
  
  /**
   * Returns a deck object exposing helper methods to manage the deck.
   */
  deck.newFunc = function() {
    var clone = { };
    clone.cards = [ ];
    clone.new = deck.newFunc;
    clone.fill = deck.fillFunc;
    clone.shuffle = deck.shuffleFunc;
    clone.take = deck.takeFunc;
    clone.add = deck.addFunc;
    clone.card = deck.cardFunc;
    clone.get = deck.getFunc;
    clone.remove = deck.removeFunc;
    return clone;
  };

  /**
   * Creates and returns a new card object.
   */
  deck.cardFunc = function(value, suit) {
    var card = { };
    // numerical value
    card.value = value;
    // suit
    card.suit = suit;
    // human readable name
    card.name = value.toString() + suit;
    // the card is face up
    card.up = false;
    // check color helpers
    card.isRed = function() {
      return this.suit == 'D' || this.suit == 'H';
    };
    card.isBlack = function() {
      return this.suit == 'S' || this.suit == 'C';
    };
    return card;
  };

  /**
   * Adds cards to the deck.
   * Accepted values:
   * + a single card obtained from deck.card()
   * + an array of cards from deck.cards or deck.take()
   * + another deck
   */
  deck.addFunc = function(card) {
    if (card.cards != undefined) {
      // another deck
      this.cards = this.cards.concat(card.cards);
    }
    else if (card.push != undefined) {
      // array of cards
      this.cards = this.cards.concat(card);
    }
    else if (card.value != undefined) {
      // single card
      this.cards.push(card);
    }
  };

  /**
   * Fills the deck with 52 cards.
   */
  deck.fillFunc = function() {
    var deck = this;
    var cards = this.cards;
    var suits = ["C", "D", "H", "S"];
    for (n=1; n<14; n++) {
      suits.forEach(function(suit) {
        cards.push(deck.card(n, suit));
      });
    }
  };

  /**
   * Shuffles the deck
   */
  deck.shuffleFunc = function() {
    var j, x, i;
    var a = this.cards;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(game.lcg.rand() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
  };

  /**
   * Take n cards from this deck and returns a new deck of the taken cards.
   */
  deck.takeFunc = function(n) {
    n = n == undefined ? 1 : n;
    var newdeck = this.new();
    var cards = this.cards;
    // limit to the amount of cards available
    if (n > cards.length) n = cards.length;
    for (i=0; i<n; i++) {
      newdeck.cards.push(cards.pop());
    }
    return newdeck;
  };

  /**
   * Gets the top card off the deck, or the nth card if specified.
   */
  deck.getFunc = function(n) {
    n = n == undefined ? this.cards.length-1 : n;
    return this.cards[n];
  };
  
  /**
   * Remove the given instance of a card.
   */
  deck.removeFunc = function(card) {
    var index = this.cards.indexOf(card);
    if (index > -1) {
      this.cards.splice(index, 1);
    }
  };
  
  /**
   * Create and return a new deck
   */
  deck.new = deck.newFunc;

})();

