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
  m.dealCallback = function(dealer, model) {
    var hand = dealer.new();
    hand.fill();
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.piles.push(hand.take(4));
    model.reserve.push(hand);
  };

  m.deal = function() {
    // reset all stacks
    m.foundations = [ ];  // list of decks
    m.piles = [ ];    // list of decks
    m.hands = [ ];    // list of decks
    m.reserve = [ ];  // one of
    m.waste = [ ];    // one of
    m.dealCallback(game.deck, m);
  };
  
})();
