/**
 * Freecell game rules.
 * 
 * Implemented by Wesley Werner
 *
 */

;(function(){
    
  // create our rules object
  var freecell = { name: 'freecell' };
  
  // The game model will request the requirements for your game.
  freecell.requestLayout = function() {
    
    var layout = { };
    
    // Number of columns and rows our game will need.
    layout.columnsRequested = 8;
    layout.rowsRequested = 4;
    
    // Play zones
    layout.zones = {
      'tableau': { col:1, row:2, width:8, height:3 },
      'Free1': { col:1, row:1, width:1, height:1, tint: 'cyan' },
      'Free2': { col:2, row:1, width:1, height:1, tint: 'cyan' },
      'Free3': { col:3, row:1, width:1, height:1, tint: 'cyan' },
      'Free4': { col:4, row:1, width:1, height:1, tint: 'cyan' },
      'A': { col:5, row:1, width:1, height:1 },
      'B': { col:6, row:1, width:1, height:1 },
      'C': { col:7, row:1, width:1, height:1 },
      'D': { col:8, row:1, width:1, height:1 }
    };

    return layout;
    
  };
  
  // Give the game rules
  freecell.requestRulesWording = function() {
    return `<h1>Freecell</h1>
            <p>FreeCell is a solitaire-based card game played with a 52-card standard deck.
            There are four open cells and four open foundations (marked A, B, C and D).
            Cards are dealt face-up into eight cascades, four of which comprise seven cards and four of which comprise six.</p>
            <p><strong>Moves</strong></p>
            <ul>
            <li>Any card may be moved into a free cell.</li>
            <li>Move a card, or a stack of cards, building down by alternating colors.</li>
            <li>Foundations are built counting up by suit.</li>
            <li>The game is won when all cards are moved to their foundation piles.</li>
            <li>You can move n cards at the same time, where n is the number of open free cells + 1.</li>
            </ul>
            `;
  };
  
  /**
   * Table deal function.
   * cards is an array and can contain:
   *   + a pile of cards
   *   + an array of piles
   */
  freecell.requestDeal = function(dealer, cards) {

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
    var maxCards = game.controller.peekByPile('Free1') ? 0 : 1;
    maxCards += game.controller.peekByPile('Free2') ? 0 : 1;
    maxCards += game.controller.peekByPile('Free3') ? 0 : 1;
    maxCards += game.controller.peekByPile('Free4') ? 0 : 1;
    maxCards += 1;
    //game.ui.info('You have enough free cells to move '+maxCards+' card'+(maxCards==1 ? '':'s'));
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
        var freeZone = game.controller.peekByPile(dropped.zone);
        if (!freeZone) {
          // free zone is empty, drop the card here
          game.controller.place(card, dropped.zone);
        }
      }

    }
    
    // Move a card or stack of cards onto another in the tableau
    if (dropped.zone == 'tableau') {
      
      // Allow on empty columns
      if (!dropped.card) {
        // move the entire dragged stack
        dragged.cards.forEach(function(card) {
          game.controller.place(card, dropped.zone, dropped.column);
        });
      }
      
      // Allow if the dropped card is opposite color and one lower in value.
      if (dropped.card) {
        var sameColor = (card.isRed() && dropped.card.isRed()) || (card.isBlack() && dropped.card.isBlack());
        var oneLower = dropped.card.value - card.value == 1;
        if (!sameColor && oneLower) {
          // move the entire dragged stack
          dragged.cards.forEach(function(card) {
            game.controller.place(card, dropped.zone, dropped.column);
          });
        }
        
    }
      
    }
    
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
      freecell.testWinCondition();
    }
    
  };
  
  /**
   * Tests for the game win condition: the top card in each foundation is a King.
   */
  freecell.testWinCondition = function() {
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
  freecell.setup = function() {
  
    game.controller.deal();
  
  };
  
  game.controller.registerGame(freecell);

})();
