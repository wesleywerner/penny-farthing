/**
 * Saves a history of games played, the game number, date and won state.
 */
;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var history = g.history = { };
  
  // Load history from disk
  history.list = game.disk.load('game history') || [ ];

  history.new = function(gameName, gameNumber) {
    var entry = { gameName:gameName, gameNumber:gameNumber, startDate:Date(), endDate:null, won:false };
    var reference = history.list.push(entry) - 1;
    game.disk.save('game history', history.list)
    return reference;
  };
  
  history.markWon = function(reference) {
    var entry = history.list[reference];
    if (entry) {
      entry.won = true;
      entry.endDate = Date();
      game.disk.save('game history', history.list)
    }
  };
  
  history.remove = function(reference) {
    history.list.splice(reference, 1);
    game.disk.save('game history', history.list)
  }
  
  history.clear = function() {
    history.list = [ ];
    game.disk.save('game history', history.list)
  };

})();

