/**
 * A function library that handles the rules of the game.
 *
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var r = g.rules = { }
  
  // Define the decks used in this ruleset.
  // (Maps to the model.decks array)
  r.DECKS = { };
  r.DECKS.COL1 = 0;
  r.DECKS.COL2 = 1;
  r.DECKS.COL3 = 2;
  r.DECKS.COL4 = 3;
  r.DECKS.COL5 = 4;
  r.DECKS.COL6 = 5;
  r.DECKS.RESERVE = 6;
  r.DECKS.HAND = 7;
  r.DECKS.DISCARD = 8;

  // Get the model object
  var m = game.model;

  /**
   * Hook into the model callbacks.
   */
  m.dealCallback = function(dealer, decks) {

    // Fill and shuffle a new hand.
    // Take 5 cards for the reserve.
    // Take 23 cards for the top echelon (becomes a new deck)
    // Add the joker to the top echelon and shuffle this deck.
    // Create six columns of four cards from the top echelon.
    // From the remaining deck, add four cards to each of the six columns.
    // Turn the top card from each column face up.
    
    var hand = dealer.new();
    hand.fill();
    hand.shuffle();

    // top echelon
    var topEch = hand.take(23);
    topEch.add(hand.card(0, 'joker'));
    topEch.shuffle();

    // six columns
    for (var i = r.DECKS.COL1; i <= r.DECKS.COL6; i++) {
      decks[i] = topEch.take(4);
    };
    
    // remaining deck goes to lower echelon
    for (var i = r.DECKS.COL1; i <= r.DECKS.COL6; i++) {
      decks[i].add(hand.take(4));
    };
    
    // turn top cards
    for (var i = r.DECKS.COL1; i <= r.DECKS.COL6; i++) {
      decks[i].get().up = true;
    };
    
    // reserve
    decks.push(hand.take(5));

  };
  
  /**
   * Hook in card positioning.
   * An array of [x, y] needs to return, or undefined to skip drawing.
   * The values of x, y are not absolute, they should fall in the range
   * 0..1 where they map to the width/height of the canvas.
   */
  game.view.calculateCardPosition = function(card, deckIndex, rowIndex) {
    var topPad = 0.05;
    var leftPad = 0.05;
    if (deckIndex == r.DECKS.RESERVE) {
      // TODO
    }
    else if (deckIndex == r.DECKS.HAND) {
      // TODO
    }
    else if (deckIndex == r.DECKS.DISCARD) {
      // TODO
    }
    else {
      return [leftPad + deckIndex * 0.11, topPad + rowIndex * 0.05];
    }
  };
  
})();
