/**
 * A function library that handles the rules of the game.
 *
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var rules = g.rules = { }
  var control = g.controller;
  
  // deal a new game on first click
  var newgame = true;
  
  // The game model will request the requirements for your game.
  rules.requestLayout = function() {
    
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
  rules.dealFunc = function(dealer, cards) {

    // An example game that display six columns of face up cards.
    // Taking a card from the tableau discards your hand.
    // Taking the joker winds the game.
    
    // create a new deck, fill and shuffle it.
    var deck = dealer.new();
    deck.fill();
    deck.shuffle();
    
    // take the top cards as our hand
    cards.hand = deck.take();
    
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
        
    //// we must initialise all 
    cards.waste = dealer.new();
    cards.reserve = dealer.new();
    
  };
  
  
  /**
   * Handles click events on the view.
   * Any game manipulations are done through the controller.
   */
  rules.clickEvent = function(zone, card) {

    var name = card == null ? '' : card.name;
    
    if (zone != undefined) {
      console.log('click hit in zone ' + zone + ' - ' + name);
    }
    
    // look at our hand
    var hand = control.peek('hand');
    
    // start a new game
    if (newgame) {
      game.ui.info('Find the joker to win the game.');
      newgame = false;
      control.deal();
      return;
    }

    if (zone == 'reserve') {
      
      // take from reserve
      if (card) {

        // discard our hand
        control.place(hand, 'waste')
        
        // place selected card into hand
        control.place(card, 'hand');

        // turn the hand card face up
        card.up = true;
        
        game.ui.info('<p>You can spy on cards of the same suit.</p><p>You can replace with cards of the same color, counting up.</p><p>You can replace cards of the opposite color, counting down.</p><p>You can panic, draw a new hand from the reserve (5 cards in total)</p><p>Find the joker to win</p>');
      }
      
    }
    
    // tableau cards can only be acted on if they are the top card, with a facing value.
    if (zone == 'tableau' && card && card.up && card.onTop) {
      
      // win condition
      if (card.value > 100) {
        newgame = true;
        game.ui.info('You won! Click for another game.');
      }

      // discard our hand
      control.place(hand, 'waste')
      // place new card in hand
      control.place(card, 'hand');
    
    }
    
    // Tell the game to redraw the canvas.
    control.redraw();

  };


  document.addEventListener("DOMContentLoaded", function(event) { 
  
    var ui = game.ui;
    ui.info('This is a card game rules template. It features a very basic game: Pick any card, your hand will be discarded. If you pick up the joker you win the game.');
  
  });

})();
