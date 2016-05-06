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
        j = Math.floor(Math.random() * i);
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

