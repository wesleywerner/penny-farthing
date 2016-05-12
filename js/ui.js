/**
 * Provides methods to update UI elements on the page.
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var ui = g.ui = { }

  /**
   * Set up the UI
   */
  document.addEventListener("DOMContentLoaded", function(event) { 
    
    ui.infoEl = document.getElementById('game-info');
    ui.reset();
    
    // handler to set the game number
    var el = document.getElementById('set-game-number');
    el.addEventListener("click", function() {
        var el = document.getElementById('game-number');
        initialize(null, parseInt(el.value));
      });
    
  });
  
  /**
   * Reset elements.
   */
  ui.reset = function() {

  };
  
  /**
   * Display info text.
   */
  ui.info = function(text) {
    if (ui.infoEl) {
      ui.infoEl.innerHTML = text;
    };
  };
  
  /**
   * Build a menu from all game objects.
   */
  ui.buildMenu = function() {
    var gameNames = Object.keys(game.games);
    var el = document.getElementById('all-games-list');
    gameNames.forEach(function(name) {
      var anchor = document.createElement('a');
      anchor.innerHTML = name.toUpperCase();
      anchor.setAttribute("onclick", "initialize('"+name+"')");
      anchor.setAttribute("href", "#");
      var listItem = document.createElement('li');
      listItem.appendChild(anchor);
      el.appendChild(listItem);
    });
  }
  
  /**
   * Display the game number.
   */
  ui.displayGameNumber = function(n) {
    var el = document.getElementById('game-number');
    if (el) el.value = n;
  };
  
})();
