/**
 * Performs testing on game objects.
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var t = g.tests = { }

  t.printDeck = function(deck) {
    var output = 'cards in this deck: ' + deck.cards.length + '\n';
    deck.cards.forEach(function(card, index) {
      output += card.name + '\t';
      if ((index+1) % 4 == 0) output += '\n';
    });
    console.log(output);
  };

  t.testDeckCreation = function() {
    console.log('test deck creation');
    var deck = g.deck.new();
    deck.fill();
    console.assert(deck.cards != undefined, 'no cards in the deck');
    console.assert(deck.cards.length == 52, 'expected 52 cards in the deck');
    //t.printDeck(deck);
  };

  t.testDeckShuffle = function() {
    console.log('test deck shuffle');
    var deck = g.deck.new();
    var shuffled = g.deck.new();
    deck.fill();
    shuffled.fill();
    shuffled.shuffle();
    console.assert(deck.cards != undefined, 'no cards in the deck');
    console.assert(deck.cards.length == 52, 'expected 52 cards in the deck');
    var exactCopies = 0;
    deck.cards.forEach(function(goodCard, index){
      var badCard = shuffled.cards[index];
      if (goodCard.value == badCard.value && goodCard.suit == badCard.suit) exactCopies++;
      });
    // Room for error: allow up to 10 cards to be in the expected position.
    // This is a shuffle after all :)
    console.assert(exactCopies < 10, 'cards are not shuffled. I got '+exactCopies+' exact copies.');
    //t.printDeck(deck);
  };

  t.testDeckTake = function() {
    console.log('test taking from the deck');
    var deck = g.deck.new();
    deck.fill();
    var reserve = deck.take(5);
    console.assert(deck.cards.length == 47, 'deck expeccted to have 47 cards after take');
    console.assert(reserve.cards.length == 5, 'reserve deck expected to have 5 cards affter take');
    var toomany = deck.take(52);
    console.assert(toomany.cards.length == 47, 'expected only 47 cards after taking more than available.');
    //t.printDeck(deck);
    //t.printDeck(reserve);
  };

  t.testDeckAdding = function() {
    console.log('test adding one card to a deck');
    var deck = g.deck.new();
    deck.fill();
    var reserve = deck.take(5);
    reserve.add(reserve.card(0, 'joker'));
    console.assert(reserve.cards.length == 6, 'reserve expected to have 6 cards after adding');
    //t.printDeck(reserve);

    console.log('test combining deck');
    var deck = g.deck.new();
    deck.fill();
    var reserve = deck.take(5);
    reserve.add(deck.take(4));
    console.assert(reserve.cards.length == 9, 'reserve expected to have 9 cards after adding');
    //t.printDeck(reserve);
    
    console.log('test adding multiple cards to a deck');
    var deck = g.deck.new();
    deck.fill();
    var reserve = deck.take(5);
    reserve.add(deck.take(4));
    console.assert(reserve.cards.length == 9, 'reserve expected to have 9 cards after adding');
    //t.printDeck(reserve);
  };
  
  t.testRandomSeed = function() {
    console.log('test random seed');
    
    // test n iterations of randomness
    var howManyRoads = 42;
    var n = [ ];
    var o = [ ];
    
    // Gather initial values
    game.lcg.setSeed(42);
    for (i=howManyRoads; i; i--) {
      n[i] = game.lcg.rand();
    };
    
    // Intermission
    game.lcg.setSeed();
    game.lcg.rand();
    game.lcg.rand();
    game.lcg.rand();
    
    // Repeat
    game.lcg.setSeed(42);
    for (i=howManyRoads; i; i--) {
      o[i] = game.lcg.rand();
    };
    
    // Verify
    for (i=howManyRoads; i; i--) {
      console.assert(n[i] == o[i], 'Random value is too random');
    };
    
  };

  // Deals a predictable layout for testing controller manipulation methods
  t.dealFunc = function(dealer, cards) {

    var deck = dealer.new();
    deck.fill();

    cards.tableau = [ ];
    for (var i = 0; i <= 5; i++) {
      cards.tableau[i] = deck.take(2);
    };
    
    cards.hand = deck.take(5);

  };

  t.testController = function() {
    
    console.log('Test dealing and game controller calls');
    var testZones = ['tableau', 'hand', 'reserve'];
    game.model.deal(t.dealFunc, testZones);
    
    var card = game.controller.peekByCol('tableau', 0);
    console.assert(card, 'Expected a card returned from peekByCol');
    console.assert(card.suit == 'H', 'Expected Hearts from peekByCol');
    console.assert(card.value == 13, 'Expected King from peekByCol');
    
    var card = game.controller.peekByRow('tableau', 0, 0);
    console.assert(card, 'Expected a card returned from peekByRow');
    console.assert(card.suit == 'S', 'Expected Spades from peekByRow');
    console.assert(card.value == 13, 'Expected King from peekByRow');
    
    var card = game.controller.peekByPile('hand');
    console.assert(card, 'Expected a card returned from peekByPile');
    console.assert(card.suit == 'S', 'Expected Spades from peekByPile');
    console.assert(card.value == 9, 'Expected Nine from peekByPile');

  };
  

  game.unitTestsRunning = true;
  t.testRandomSeed();
  t.testDeckCreation();
  t.testDeckShuffle();
  t.testDeckTake();
  t.testDeckAdding();
  t.testController();
  
})();
