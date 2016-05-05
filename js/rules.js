/**
 * A function library that handles the rules of the game.
 *
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var r = g.rules = { }
  
  // The game model will request the requirements for your game.
  r.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 6;
    layout.rowsRequested = 3;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:1, width:6, height:1},  // entire top row
      'reserve': { col:1, row:3, width:1, height:1},  // bottom left
      'waste': { col:2, row:3, width:1, height:1},    // next to reserve
      'hand': { col:6, row:3, width:1, height:1}     // bottom right
    };

    return layout;
    
  }
  
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
   * Table deal function.
   * cards is an array and can contain:
   *   + a pile of cards
   *   + an array of piles
   */
  r.dealFunc = function(dealer, cards) {

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

    // tableau (an array of piles)
    cards.tableau = [ ];
    for (var i = r.DECKS.COL1; i <= r.DECKS.COL6; i++) {
      cards.tableau[i] = topEch.take(4);
    };
    
    // remaining deck goes to lower echelon
    for (var i = r.DECKS.COL1; i <= r.DECKS.COL6; i++) {
      cards.tableau[i].add(hand.take(4));
    };
    
    // turn top cards
    for (var i = r.DECKS.COL1; i <= r.DECKS.COL6; i++) {
      cards.tableau[i].get().up = true;
    };
    
    // reserve
    cards.reserve = hand.take(5);
    
    // new waste pile
    cards.waste = dealer.new();
    
    cards.hand = dealer.new();

  };
    
})();
