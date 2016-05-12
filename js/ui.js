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
    
    // This hook collapses the navbar after clicking a link,
    // but only if the nav is expanded. This hides the nav bar nicely
    // on mobile devices after link clicks.
    $(document).on('click','.navbar-collapse.in',function(e) {
        if( $(e.target).is('a') ) {
            $(this).collapse('hide');
        }
    });

    // handler to set the game number
    var el = document.getElementById('set-game-number');
    el.addEventListener("click", function() {
        var el = document.getElementById('game-number');
        game.ui.initialize(null, parseInt(el.value));
      });
    
  });
  
  
  /**
   * Start a new game, or restart the current game if null name is given.
   * A specific seed can be given too, or one will be generated otherwise.
   */
  ui.initialize = function(gamename, newseed) {
    // prompt on restart
    if (!gamename) {
      if (!confirm('Restart your game?')) return;
    }
    var el = document.getElementById('playfield');
    game.controller.initialize(el, gamename, newseed);
    game.ui.displayGameNumber(game.controller.seed);
  };
  
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
      anchor.setAttribute("onclick", "game.ui.initialize('"+name+"')");
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
