/**
 * A function library that handles the rules of the game.
 *
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var rules = g.rules = { }
  var control = g.controller;
  
  // The game model will request the requirements for your game.
  rules.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 6;
    layout.rowsRequested = 3;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:1, width:6, height:1.5},  // entire top row
      'reserve': { col:1, row:3, width:1, height:1},  // bottom left
      'waste': { col:2, row:3, width:1, height:1},    // next to reserve
      'hand': { col:6, row:3, width:1, height:1}     // bottom right
    };

    return layout;
    
  }
  
  /**
   * Table deal function.
   * cards is an array and can contain:
   *   + a pile of cards
   *   + an array of piles
   */
  rules.dealFunc = function(dealer, cards) {

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
    for (var i = 0; i <= 5; i++) {
      cards.tableau[i] = topEch.take(4);
    };
    
    // remaining deck goes to lower echelon
    for (var i = 0; i <= 5; i++) {
      cards.tableau[i].add(hand.take(4));
    };
    
    // turn top cards
    for (var i = 0; i <= 5; i++) {
      cards.tableau[i].get().up = true;
    };
    
    // reserve
    cards.reserve = hand.take(5);
    
    // new waste pile
    cards.waste = dealer.new();
    
    cards.hand = dealer.new();

  };
  
  
  /**
   * Handles click events on the view.
   * Any game manipulations are done through the controller.
   */
  rules.clickEvent = function(zone, card) {

    var name = card == undefined ? '' : card.name;
    
    if (zone != undefined) {
      console.log('click hit in zone ' + zone + ' - ' + name);
    }
    
    if (zone == 'reserve') {
      
      // take from reserve
      var reservecard = control.take('reserve');

      if (reservecard) {

        // take from our hand
        var handcard = control.take('hand');   // get the cards in hand

        // place into waste
        control.place(handcard, 'waste'); // move the hand card to the waste
        
        // place into hand
        control.place(reservecard, 'hand');

        // turn the hand card face up
        reservecard.up = true;
      }
      
    }
    
    if (zone == 'tableau') {
      
      // look at our hand
      var hand = control.peek('hand');
      
      // tableau card is lower
      var canSwitch = card.value < hand.value;
      
      if (canSwitch) {
        console.log('switching cards');
        // discard our hand
        control.place(control.take('hand'), 'waste');
        // remove from tableau
        control.remove(card, 'tableau');
        // place new card in hand
        control.place(card, 'hand');
      }
      
    }

  };
    
})();
