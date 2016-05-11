/**
 * Freecell game rules.
 * 
 * Implemented by Wesley Werner
 *
 */

;(function(){
  
  // reference the game object
  var g = window.game = window.game == undefined ? { } : window.game;

  // refrence the controller.
  // We perform any card manipulations through here.
  var control = g.controller;
  
  // create our rules object
  var freecell = game.games.freecell = { };
  
  // The game model will request the requirements for your game.
  freecell.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 9;
    layout.rowsRequested = 3;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:2, width:8, height:2},
      'Free1': { col:1, row:1, width:1, height:1},
      'Free2': { col:2, row:1, width:1, height:1},
      'Free3': { col:3, row:1, width:1, height:1},
      'Free4': { col:4, row:1, width:1, height:1},
      'A': { col:6, row:1, width:1, height:1},
      'B': { col:7, row:1, width:1, height:1},
      'C': { col:8, row:1, width:1, height:1},
      'D': { col:9, row:1, width:1, height:1}
    };

    return layout;
    
  }
  
  /**
   * Table deal function.
   * cards is an array and can contain:
   *   + a pile of cards
   *   + an array of piles
   */
  freecell.dealFunc = function(dealer, cards) {

    // fill and shuffle
    var deck = dealer.new();
    deck.fill();
    deck.shuffle();
    
    // face all the cards up
    deck.cards.forEach(function(card){
      card.up = true;
    });

    // tableau (an array of eight piles)
    cards.tableau = [ ];
    for (var i = 0; i <= 7; i++) {
      cards.tableau[i] = deck.take(6);
    };
    
    // one more card on first four piles
    for (var i = 0; i <= 4; i++) {
      cards.tableau[i].add(deck.take(1));
    };
  
  };
  

  /**
   * Called when the game needs to consult if a drag action is allowed.
   * The dragged object contains the zone, and a cards array.
   */
  freecell.allowDragEvent = function(dragged) {
    
    // Allow moving n cards, where n is the count of free cells + 1.
    // Also only allow moving if the dragged cards are in descending order
    // and of alternating color.
    var maxCards = control.peek('Free1') ? 0 : 1;
    maxCards += control.peek('Free2') ? 0 : 1;
    maxCards += control.peek('Free3') ? 0 : 1;
    maxCards += control.peek('Free4') ? 0 : 1;
    maxCards += 1;
    game.ui.info('You have enough free cells to move '+maxCards+' card'+(maxCards==1 ? '':'s'));
    if (dragged.cards.length > maxCards) return false;

    // Ensure alternating colors and descending rank
    var prevValue = dragged.cards[0].value;
    var prevRed = dragged.cards[0].isRed();
    for (i=1; i<dragged.cards.length; i++) {
      var thisValue = dragged.cards[i].value;
      var thisRed = dragged.cards[i].isRed();
      if (prevValue - thisValue != 1) return false;
      if (prevRed == thisRed) return false
      prevValue = thisValue;
      prevRed = thisRed;
    }
    return true;
  };
  
  
  /**
   * Handles click events on the view.
   * Any game manipulations are done through the controller.
   */
  freecell.dropEvent = function(dragged, dropped) {

    if (!dropped.zone) return;
    if (dragged.cards.length == 0) return;
    var card = dragged.cards[0];

    if (dragged.zone == 'tableau') {
    
      // move on to a free cell
      if (dragged.cards.length == 1 && dropped.zone.startsWith('Free')) {
        var freeZone = control.peek(dropped.zone);
        if (!freeZone) {
          // free zone is empty, drop the card here
          control.place(card, dropped.zone);
        }
      }

    }
    
    if (dropped.zone == 'tableau' && dropped.card) {
      
      // Allow the move if the dropped card is opposite color
      // and one lower in value.
      var sameColor = (card.isRed() && dropped.card.isRed()) || (card.isBlack() && dropped.card.isBlack());
      var oneLower = dropped.card.value - card.value == 1;
      if (!sameColor && oneLower) {
        control.place(card, dropped.zone, dropped.card.pos.col);
      }
      
    }
    
    if (dropped.zone == 'A' || dropped.zone == 'B' || dropped.zone == 'C' || dropped.zone == 'D') {
      var foundation = control.peek(dropped.zone);
      if (!foundation && card.value == 1) {
        // place an ace
        control.place(card, dropped.zone);
      }
      else if (foundation && foundation.suit == card.suit && card.value - foundation.value == 1) {
        // stack on foundation
        control.place(card, dropped.zone);
      }
    }
    
    // Tell the game to redraw the canvas.
    control.redraw();

  };

  /**
   * The setup function is called when our rule is selected.
   */
  freecell.setup = function() {
  
    var ui = game.ui;
    ui.info('This is a card game rules freecell. It features a very basic game: Pick any card, your hand will be discarded. If you pick up the joker you win the game.');
    control.deal();
  
  };

})();
