/**
 * A classical solitaire game.
 * Rule created by Wesley.
 *
 */

;(function(){
  
  // create our rules object
  var klondike = game.games.klondike = { };
  
  // The game model will request the requirements for your game.
  klondike.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 7;
    layout.rowsRequested = 4;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:2, width:7, height:3 },
      'reserve': { col:1, row:1, width:1, height:1 },
      'waste': { col:2, row:1, width:1, height:1 },
      'A': { col:4, row:1, width:1, height:1 },
      'B': { col:5, row:1, width:1, height:1 },
      'C': { col:6, row:1, width:1, height:1 },
      'D': { col:7, row:1, width:1, height:1 }
    };
    
    layout.victory = {
      text: 'You Won!',
      color: 'pink',
      card: '12H'
      };

    return layout;
    
  }
  
  // Give the game rules
  klondike.requestRulesWording = function() {
    return `<h1>Klondike</h1>
            <p>Klondike is one of the well known solitaire games.</p>
            <h3><a id="Goal_3"></a>Goal</h3>
            <p>Move all the cards to the foundation piles, A, B, C and D.</p>
            <h3><a id="Play_6"></a>Play</h3>
            <ul>
            <li>Build stacks counting down by alternating color.</li>
            <li>You can move entire stacks as long as they match this pattern.</li>
            <li>Tap the reserve to flip new cards.</li>
            <li>Tap the waste pile to recycle it back into the reserve.</li>
            <li>Kings may be moved to empty columns.</li>
            </ul>`;
  };
  
  /**
   * Table deal function.
   * cards is an array and can contain:
   *   + a pile of cards
   *   + an array of piles
   */
  klondike.requestDeal = function(dealer, cards) {
    
    // create a new deck, fill and shuffle it.
    var deck = dealer.new();
    deck.fill();
    deck.shuffle();
    
    // tableau
    cards.tableau = [ ];
    for (var i = 0; i < 7; i++) {
      cards.tableau[i] = deck.take(i+1);
      cards.tableau[i].get().up = true;
    };
    
    cards.reserve = deck;
  
  };
  
  
  /**
   * Called when the game needs to consult if a drag action is allowed.
   * The dragged object contains the zone, and a cards array.
   */
  klondike.allowDragEvent = function(dragged) {
    
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
  klondike.dropEvent = function(dragged, dropped) {

    if (!dropped.zone) return;
    if (dragged.cards.length == 0) return;
    var card = dragged.cards[0];

    // a tableau move
    if (dropped.zone == 'tableau') {
      
      var validMove = false;
      
      // move a king to empty columns
      if (!dropped.card && card.value == 13) {
        validMove = true;
      }
      
      // Allow if the dropped card is opposite color and one lower in value.
      if (dropped.card) {
        var sameColor = (card.isRed() && dropped.card.isRed()) || (card.isBlack() && dropped.card.isBlack());
        var oneLower = dropped.card.value - card.value == 1;
        if (!sameColor && oneLower) {
          validMove = true;
        }
      
        // Turn the card face up
        var remainder = game.controller.peekByCol(dragged.zone, dragged.column);
        if (remainder) remainder.up = true;
    
      }
      
      // move the entire dragged stack
      if (validMove) {
        dragged.cards.forEach(function(card) {
          game.controller.place(card, dropped.zone, dropped.column);
        });
      };
      
    }
    
    // Drop on one of the foundation piles, A, B, C or D
    if (dropped.zone == 'A' || dropped.zone == 'B' || dropped.zone == 'C' || dropped.zone == 'D') {
      var foundation = game.controller.peekByPile(dropped.zone);
      if (!foundation && card.value == 1) {
        // place an ace
        game.controller.place(card, dropped.zone);
      }
      else if (foundation && foundation.suit == card.suit && card.value - foundation.value == 1) {
        // stack on foundation
        game.controller.place(card, dropped.zone);
      }
      klondike.testWinCondition();
    }
    
    // Turn a reserve card
    if (dropped.zone == 'reserve') {
      var nextCard = game.controller.peekByPile('reserve');
      
      if (nextCard) {
        // move to waste, face up
        nextCard.up = true;
        game.controller.place(nextCard, 'waste');
      }
      
    };
    
    // Reset the reserve pile
    if (dropped.zone == 'waste') {
      var reserveEmpty = game.controller.peekByPile('reserve') == null;
      if (reserveEmpty) {
        var reservePile = game.controller.take('waste', 52);
        reservePile.cards.forEach(function(card) {
          card.up = false;
          game.controller.place(card, 'reserve');
        });
      }
    };
    
  };

  /**
   * Tests for the game win condition: the top card in each foundation is a King.
   */
  klondike.testWinCondition = function() {
    var f1 = game.controller.peekByPile('A');
    var f2 = game.controller.peekByPile('B');
    var f3 = game.controller.peekByPile('C');
    var f4 = game.controller.peekByPile('D');
    var won = (f1 && f1.value==13 && f2 && f2.value==13 && f3 && f3.value==13 && f4&&f4.value==13);
    if (won) game.controller.won();
  };

  /**
   * The setup function is called when our rule is selected.
   */
  klondike.setup = function() {
  
    game.controller.deal();
  
  };

})();
