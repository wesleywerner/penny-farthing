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
      ui.showGameHistory();
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
        // if gamename is empty, it means to play the current game again, as stored in game.controller.gameName
        if (!confirm('Start a new game of '+(gamename || game.controller.gameName)+'?')) return;
      }
    }
        
    // Initialize a new game with the given seed
    var el = document.getElementById('playfield');
    game.controller.initialize(el, gamename, seed);
    
    // Display the seed in the ui
    game.ui.displayGameNumber(game.controller.seed);
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
   * Build and show the game history.
   */
  ui.showGameHistory = function() {
    var table = document.getElementById('game-ui-history-table');
    table.innerHTML = '';

    var addHistoryCell = function(row, value) {
      var cell = document.createElement('td');
      cell.innerHTML = value;
      row.appendChild(cell);
      return cell;
    };
    
    var addReplayLink = function(row, gameName, number) {
      var anchor = document.createElement('a');
      anchor.innerHTML = '#'+number.toString();
      //anchor.setAttribute('onclick', 'game.ui.initialize("'+gameName+'", '+number+')');
      anchor.setAttribute('href', '#');
      anchor.onclick = function(){ game.ui.initialize(gameName, number) };
      
      var cell = document.createElement('td');
      cell.appendChild(anchor);
      row.appendChild(cell);
    };
    
    var addHistoryRow = function(data) {
      var row = document.createElement('tr');
      // Game name
      addHistoryCell(row, data.gameName);
      // Game number with link
      addReplayLink(row, data.gameName, data.gameNumber);
      
      // Date with tooltip
      var cell = addHistoryCell(row, moment(data.startDate).fromNow());
      cell.setAttribute('title', data.startDate);
      // Won
      addHistoryCell(row, data.won ? 'Yes' : 'No');
      // Highlight won rows
      if (data.won) row.classList.add('success');
      table.appendChild(row);
    };
    
    for (i=game.history.list.length-1; i>0; i--) {
      addHistoryRow(game.history.list[i]);
    }

    // Display the modal
    $('#GameHistoryModal').modal('show');
    
  };
  
  /**
   * Display the game number.
   */
  ui.displayGameNumber = function(n) {
    var el = document.getElementById('game-number');
    if (el) el.value = n;
  };
  
})();
