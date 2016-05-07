/**
 * A function library that handles the rules of the game.
 *
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var rules = g.rules = { }
  var control = g.controller;
  
  var action = 'spy';
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
  rules.clickEvent = function(zone, card) {

    var name = card == null ? '' : card.name;
    
    if (zone != undefined) {
      console.log('click hit in zone ' + zone + ' - ' + name);
    }
    
    // look at our hand
    var hand = control.peek('hand');
    
    // start a new game
    if (newgame) {
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
      }
      
    }
    
    // tableau cards can only be acted on if they are the top card, with a facing value.
    if (zone == 'tableau' && card && card.up && card.onTop) {
      
      if (action == 'replace') {
        
        // If the target card is the same color as your Shape, your Shape's value
        // must be lower than the target card's value.
        // If the card is a different color than your Shape, your
        // Shape's value must be higher than the target card's value.
        
        var handcolor = (hand.suit == 'D' || hand.suit == 'H' ? 'red' : 'black');
        var cardcolor = (card.suit == 'D' || card.suit == 'H' ? 'red' : 'black');
        
        if (handcolor == cardcolor) {
          var canSwitch = card.up && (card.value > hand.value)
        }
        else {
          var canSwitch = card.up && (card.value < hand.value)
        }
        
        if (canSwitch) {
          
          // discard our hand
          control.place(hand, 'waste')
          
          // place new card in hand
          control.place(card, 'hand');
        }
      
      }
      
      if (action == 'spy') {
        
        // cards receive the clickedColRow property of the column / row of the pile(s) the live in.
        
        if (card.suit == hand.suit) {
          
          // show adjacent cards
          var pos = card.clickedColRow;
          
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
  
  document.addEventListener("DOMContentLoaded", function(event) { 

    var container = document.getElementsByTagName('footer')[0];
    
    var btnSpy = document.createElement('button');
    btnSpy.innerHTML = 'SPY';
    btnSpy.style.width = '20%';
    btnSpy.style.height = '50px';
    btnSpy.onclick = function(){
      action='spy';
      btnSpy.style.backgroundColor = 'gray';
      btnRep.style.backgroundColor = '';
      btnSpy.style.color = 'white';
      btnRep.style.color = '';
      }
    container.appendChild(btnSpy);

    var btnRep = document.createElement('button');
    btnRep.innerHTML = 'REPLACE';
    btnRep.style.width = '20%';
    btnRep.style.height = '50px';
    btnRep.style.backgroundColor = 'gray';
    btnRep.style.color = 'white';

    btnRep.onclick = function(){
      action='replace';
      btnSpy.style.backgroundColor = '';
      btnRep.style.backgroundColor = 'gray';
      btnSpy.style.color = '';
      btnRep.style.color = 'white';
      }
    container.appendChild(btnRep);
    
  });

})();
