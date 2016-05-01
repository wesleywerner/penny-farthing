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
  
  t.testDeckCreation();
  t.testDeckShuffle();
  t.testDeckTake();
  t.testDeckAdding();

  t.testDeal = function() {
    game.model.deal();
  };

  t.testDeal();
  
})();
