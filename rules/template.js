/**
 * A function library that handles the rules of the game.
 *
 *
 */

;(function(){
  
  // refrence the controller.
  // We perform any card manipulations through here.
  var control = game.controller;
  
  // create our rules object
  var template = game.games.template = { };
  
  // The game model will request the requirements for your game.
  template.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 6;
    layout.rowsRequested = 4;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:2, width:6, height:3},
      'reserve': { col:1, row:1, width:1, height:1},
      'discard': { col:2, row:1, width:1, height:1},
      'hand': { col:6, row:1, width:1, height:1}
    };
    
    layout.victory = {
      text: 'Winner!',
      color: 'cyan',
      card: '12H'
      };

    return layout;
    
  }
  
  // Give the game rules
  template.requestRulesWording = function() {
    return '<p>This is a template game you can use to build your own card games.</p><p>The rules are simple:</p> <ul><li>Pick any top card to replace your current hand, which will be discarded</li><li>If you pick up the joker you win the game.</li></ul>';
  };
  
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
    var hand = control.peekByPile('hand');
    
    if (dropped.card) console.log('Dropped on card ' + dropped.card.name);

    // win condition
    if (hand && hand.value > 100) return;
    
    // tableau cards can only be acted on if they are the top card, with a facing value.
    if (dragged.zone == 'tableau' && dropped.zone == 'hand') {
      
      // move the card to the drag pile
      var len = dragged.cards.length;
      if (len == 1) {
        
        var card = dragged.cards[0];
        
        // win condition
        if (card.value > 100) {
          // Show the win screen
          control.won();
        }

        // discard our hand
        control.place(control.take('hand'), 'discard')
        
        // place new card in hand
        control.place(card, 'hand');
    
      };
    }
    
  };

  /**
   * The setup function is called when our rule is selected.
   */
  template.setup = function() {
  
    control.deal();
  
  };

})();
