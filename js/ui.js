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

    // Replay a known game number
    var el = document.getElementById('game-ui-replay');
    el.addEventListener("click", function() {
      ui.scrollToView();
      var el = document.getElementById('game-number');
      ui.initialize(null, parseInt(el.value));
    });
    
    // Play a new (random) game
    var el = document.getElementById('game-ui-new');
    el.addEventListener("click", function() {
      ui.scrollToView();
      ui.initialize();
    });

    // Show game history
    var el = document.getElementById('game-ui-history');
    el.addEventListener("click", function() {
      alert('show history')
    });
    
  });
  
  
  /**
   * Scroll the playfield into view.
   */
  ui.scrollToView = function() {
    document.getElementById('playfield').scrollIntoView();
  };

  
  /**
   * Start a new game, or restart the current game if null name is given.
   * A specific seed can be given too, or one will be generated otherwise.
   */
  ui.initialize = function(gamename, seed) {
    
    if (game.controller.gameName) {
      if (seed) {
        if (!confirm('Replay game #'+seed+'?')) return;
      }
      else {
        if (!confirm('Start a new game of '+game.controller.gameName+'?')) return;
      }
    }
        
    // Initialize a new game with the given seed
    var el = document.getElementById('playfield');
    game.controller.initialize(el, gamename, seed);
    
    // Display the seed in the ui
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
  ui.buildGamesMenu = function() {
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
