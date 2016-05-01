/**
 * A functional library that offers handling a deck of cards.
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var d = g.deck = { }

  /**
   * Returns a deck object exposing helper methods to manage the deck.
   */
  d.newFunc = function() {
    var clone = { };
    clone.cards = [ ];
    clone.new = d.newFunc;
    clone.fill = d.fillFunc;
    clone.shuffle = d.shuffleFunc;
    clone.take = d.takeFunc;
    clone.add = d.addFunc;
    clone.card = d.cardFunc;
    clone.get = d.getFunc;
    return clone;
  };

  /**
   * Creates and returns a new card object.
   */
  d.cardFunc = function(value, suit) {
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
  d.addFunc = function(card) {
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
  d.fillFunc = function() {
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
  d.shuffleFunc = function() {
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
  d.takeFunc = function(n) {
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
  d.getFunc = function(n) {
    n = n == undefined ? this.cards.length-1 : n;
    return this.cards[n];
  };
  
  /**
   * Create and return a new deck
   */
  d.new = d.newFunc;

})();

