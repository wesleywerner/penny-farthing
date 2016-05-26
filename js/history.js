/**
    This file is part of Penny Farthing.

    Penny Farthing is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Penny Farthing is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Penny Farthing.  If not, see <http://www.gnu.org/licenses/>.
  */
  
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

