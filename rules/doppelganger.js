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
    
    layout.victory = {
      text:'Victory',
      color:'yellow',
      card:'101JOKER'
      };

    return layout;
    
  }
  
  // Give the game rules
  doppel.requestRulesWording = function() {
    return `<h1>Doppelganger</h1>
<p>A patience card game created by unpronounceable for Ludum Dare 35</p>
<h3><a id="Goal_3"></a>Goal</h3>
<p>Work your way through the stronghold (tableau), replacing people and spying to open up new options available to you. The goal is to find and replace the joker hidden within the stronghold.</p>
<h3><a id="Spying_6"></a>Spying</h3>
<p><em>Action: Tap a card</em><br>
Spying is used to reveal cards in the Stronghold. Touch a face-up card at the bottom
of a column that has the <em>same suit</em> as your Shape card. Adjacent cards are then revealed.</p>
<h3><a id="Replacing_11"></a>Replacing</h3>
<p><em>Action: Drag from stronghold to Hand</em><br>
Replacing is used to work your way through the Stronghold. Aces low.</p>
<ul>
<li>Replace cards of the same color, if counting up.</li>
<li>Replace cards of the opposite color, if counting down.</li>
</ul>
<h3><a id="Panic_17"></a>Panic</h3>
<p><em>Action: Drag from reserve to hand</em>
When you Panic you discard your current Shape and take the top card of the Reserve as your new Shape. You only get 5 reserve cards.</p>
<h3><a id="Official_Rules_21"></a>Official Rules</h3>
<p><a href="http://ludumdare.com/compo/ludum-dare-35/?action=preview&amp;uid=18422">http://ludumdare.com/compo/ludum-dare-35/?action=preview&amp;uid=18422</a></p>`;
  };
  
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
  
  
  doppel.allowDragEvent = function(dragged) {
    
    // Only allow single card drags
    return dragged.cards.length == 1;
    
  };
  
  
  /**
   * Handles click events on the view.
   * Any game manipulations are done through the controller.
   */
  doppel.dropEvent = function(dragged, dropped) {

    if (dragged.cards.length != 1) return;
    
    var draggedCard = dragged.cards[0];
    
    // look at our hand
    var hand = control.peekByPile('hand');
    
    // win condition
    if (hand && hand.value > 100) return;
    
    // take from reserve
    if (dragged.zone == 'reserve' && dropped.zone == 'hand') {
      
      // discard our hand
      control.place(hand, 'waste')
      
      // place selected card into hand
      control.place(draggedCard, 'hand');

      // turn the hand card face up
      draggedCard.up = true;
      
      hand = draggedCard;
      
    }
    
    // nothing below can happen without a card in hand
    if (!hand) return;
    
    // tableau cards can only be acted on if they are the top card, with a facing value.
    if (draggedCard.up && draggedCard.onTop) {
      
      // Dragging from the tableau to the hand does a replace
      if (dragged.zone == 'tableau' && dropped.zone == 'hand') {
        
        // If the target card is the same color as your Shape, your Shape's value
        // must be lower than the target card's value.
        // If the card is a different color than your Shape, your
        // Shape's value must be higher than the target card's value.
        
        var handcolor = (hand.suit == 'D' || hand.suit == 'H' ? 'red' : 'black');
        var cardcolor = (draggedCard.suit == 'D' || draggedCard.suit == 'H' ? 'red' : 'black');
        
        if (handcolor == cardcolor) {
          var canSwitch = (draggedCard.value > hand.value)
        }
        else {
          var canSwitch = (draggedCard.value < hand.value)
        }
        
        // win condition
        if (draggedCard.value > 100) {
          control.won();
          canSwitch = true;
        }
        
        if (canSwitch) {
          
          // discard our hand
          control.place(hand, 'waste')
          
          // place new card in hand
          control.place(draggedCard, 'hand');
          
          hand = draggedCard;
        }
      
      }
      
      // Clicking on a tableau card performs a spy action
      if (dragged.zone == 'tableau' && dropped.zone == 'tableau') {
        
        // cards receive the clickedColRow property of the column / row of the pile(s) the live in.
        
        if (draggedCard.suit == hand.suit) {
          
          // show adjacent cards
          var pos = draggedCard.clickedColRow;
          
          // directly above
          var acard = control.peekByRow('tableau', pos.col, Math.max(1, pos.row-1) );
          if (acard) acard.up = true;

          // to the left
          acard = control.peekByRow('tableau', Math.max(1, pos.col-1), pos.row );
          if (acard) acard.up = true;
          
          // to the right
          acard = control.peekByRow('tableau', Math.min(6, pos.col+1), pos.row );
          if (acard) acard.up = true;
          
        }
        
      }
    
    }
    
  };


  doppel.setup = function() {
  
    control.deal();
    
  };

})();
