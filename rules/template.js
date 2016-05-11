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
  var template = game.games.template = { };
  
  // The game model will request the requirements for your game.
  template.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 6;
    layout.rowsRequested = 3;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:2, width:6, height:2},  // entire top row
      'reserve': { col:1, row:1, width:1, height:1},  // bottom left
      'discard': { col:2, row:1, width:1, height:1},    // next to reserve
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
  template.dealFunc = function(dealer, cards) {

    // An example game that display six columns of face up cards.
    // Taking a card from the tableau discards your hand.
    // Taking the joker winds the game.
    
    // create a new deck, fill and shuffle it.
    var deck = dealer.new();
    deck.fill();
    deck.shuffle();
    
    // take the top cards as our hand
    cards.hand = deck.take();
    // face our hand up. Since a hand is a pile of cards, get the first item from this pile.
    cards.hand.get().up = true;
    
    // add the joker to the deck and reshuffle.
    // the joker value can be 101, 102 or 103, each corresponding
    // to a different image of the joker
    deck.add(deck.card(103, 'JOKER'));
    deck.shuffle();
    
    // face all the cards up
    deck.cards.forEach(function(card){
      card.up = true;
    });

    // tableau (an array of six piles)
    cards.tableau = [ ];
    for (var i = 0; i <= 5; i++) {
      cards.tableau[i] = deck.take(9);
    };
    
    // any zones we do not initialize (reserve, discard) will get set
    // to empty piles for us when our deal function ends.
  
  };
  
  
  /**
   * Called when the game needs to consult if a drag action is allowed.
   * The dragged object contains the zone, and a cards array.
   */
  template.allowDragEvent = function(dragged) {
    
    // Only allow single drags:
    // return dragged.cards.length == 1;
    
    return true;
    
  };
  
    
  /**
   * Handles click events on the view.
   * Any game manipulations are done through the controller.
   */
  template.dropEvent = function(dragged, dropped) {

    // The dragged and dropped objects specify the zone and card where this action took place.
    // dragged.zone is where the action began, dropped.zone is where the action ended.
    
    // look at our hand
    var hand = control.peek('hand');

    // win condition
    if (hand && hand.value > 100) return;
    
    // tableau cards can only be acted on if they are the top card, with a facing value.
    if (dragged.zone == 'tableau' && dropped.zone == 'hand') {
      
      // move each card in the drag pile
      var len = dragged.cards.length;
      if (len > 1) {
        game.ui.info('You dragged '+len+' cards. This is a feature of our game engine, but for this template game, play one card at a time, please ;)');
      }
      else if (len == 1) {
        
        var card = dragged.cards[0];
        
        // win condition
        if (card.value > 100) {
          game.ui.info('You won!');
        }

        // discard our hand
        control.place(control.take('hand'), 'discard')
        
        // place new card in hand
        control.place(card, 'hand');
    
      };
    }
    
    // Tell the game to redraw the canvas.
    control.redraw();

  };

  /**
   * The setup function is called when our rule is selected.
   */
  template.setup = function() {
  
    var ui = game.ui;
    ui.info('This is a card game rules template. It features a very basic game: Pick any card, your hand will be discarded. If you pick up the joker you win the game.');
    control.deal();
  
  };

})();
