/**
 * A function library that handles the rules of the game.
 *
 *
 */

;(function(){

  // reference the game object
  var g = window.game = window.game == undefined ? { } : window.game;

  // refrence the controller.
  // We perform any card manipulations through here.
  var control = g.controller;

  // create our rules object
  var doppel = game.games.doppelganger = { };
  
  doppel.newgame = true;
  
  // The game model will request the requirements for your game.
  doppel.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 6;
    layout.rowsRequested = 3;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:2, width:6, height:2},  // entire top row
      'reserve': { col:1, row:1, width:1, height:1},  // bottom left
      'waste': { col:2, row:1, width:1, height:1},    // next to reserve
      'hand': { col:6, row:1, width:1, height:1}     // bottom right
    };

    return layout;
    
  }
  
  /**
   * Table deal function.
   * cards is an array and can contain:
   *   + a pile of cards
   *   + an array of piles
   */
  doppel.dealFunc = function(dealer, cards) {

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
    topEch.add(hand.card(103, 'JOKER'));
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
  doppel.clickEvent = function(dragged, dropped) {

    // look at our hand
    var hand = control.peek('hand');
    
    // win condition
    if (hand && hand.value > 100) return;
    
    // start a new game
    if (doppel.newgame) {
      doppel.newgame = false;
      control.deal();
      game.ui.info('Draw a card from the reserve');
      return;
    }
    
    if (dragged.zone == 'reserve' && dropped.zone == 'hand') {
      
      // take from reserve
      if (dragged.card) {

        // discard our hand
        control.place(hand, 'waste')
        
        // place selected card into hand
        control.place(dragged.card, 'hand');

        // turn the hand card face up
        dragged.card.up = true;
        
        game.ui.info('<p>You can spy on cards of the same suit.</p><p>You can replace with cards of the same color, counting up.</p><p>You can replace cards of the opposite color, counting down.</p><p>You can panic, draw a new hand from the reserve (5 cards in total)</p><p>Find the joker to win</p>');
      }
      
    }
    
    // nothing below can happen without a card in hand
    if (!hand) return;
    
    // tableau cards can only be acted on if they are the top card, with a facing value.
    if (dragged.zone == 'tableau' && dragged.card && dragged.card.up && dragged.card.onTop) {
      
      // Dragging from the tableau to the hand does a replace
      if (dragged.zone == 'tableau' && dropped.zone == 'hand') {
        
        // If the target card is the same color as your Shape, your Shape's value
        // must be lower than the target card's value.
        // If the card is a different color than your Shape, your
        // Shape's value must be higher than the target card's value.
        
        var handcolor = (hand.suit == 'D' || hand.suit == 'H' ? 'red' : 'black');
        var cardcolor = (dragged.card.suit == 'D' || dragged.card.suit == 'H' ? 'red' : 'black');
        
        if (handcolor == cardcolor) {
          var canSwitch = (dragged.card.value > hand.value)
        }
        else {
          var canSwitch = (dragged.card.value < hand.value)
        }
        
        // win condition
        if (dragged.card.value > 100) {
          canSwitch = true;
          game.ui.info('You won!');
        }
        
        if (canSwitch) {
          
          // discard our hand
          control.place(hand, 'waste')
          
          // place new card in hand
          control.place(dragged.card, 'hand');
        }
      
      }
      
      // Clicking on a tableau card performs a spy action
      if (dragged.zone == 'tableau' && dropped.zone == 'tableau') {
        
        // cards receive the clickedColRow property of the column / row of the pile(s) the live in.
        
        if (dragged.card.suit == hand.suit) {
          
          // show adjacent cards
          var pos = dragged.card.clickedColRow;
          
          // directly above
          var acard = control.byColRow('tableau', pos.col, Math.max(1, pos.row-1) );
          if (acard) acard.up = true;

          // to the left
          acard = control.byColRow('tableau', Math.max(1, pos.col-1), pos.row );
          if (acard) acard.up = true;
          
          // to the right
          acard = control.byColRow('tableau', Math.min(6, pos.col+1), pos.row );
          if (acard) acard.up = true;
          
        }
        
      }
    
    }
    
    control.redraw();

  };


  doppel.setup = function() {
  
    doppel.newgame = true;
    
  };

})();
