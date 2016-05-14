/**
 * Saves a history of games played, the game number, date and won state.
 */
;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var history = g.history = { };
  
  history.list = [ ];

  history.new = function(gameName, gameNumber) {
    var entry = { gameName:gameName, gameNumber:gameNumber, startDate:Date(), endDate:null, won:false };
    return history.list.push(entry) - 1;
  };
  
  history.markWon = function(reference) {
    var entry = history.list[reference];
    if (entry) {
      entry.won = true;
      entry.endDate = Date();
    }
  }

})();

