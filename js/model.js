/**
 * Handles the game data and glues the rules logic to this data.
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var m = g.model = { }

  /**
   * Callback functions that the game rules can hook into
   * for when feedback is needed when performing an action.
   */

  /**
   * When a new game is dealt.
   */
  m.dealCallback = function(dealer, cards) {
    var hand = dealer.new();
    hand.fill();
    cards.hand = hand;
  };

  m.deal = function() {
    m.cards = { };
    game.rules.dealFunc(game.deck, m.cards);
  };
  
})();
