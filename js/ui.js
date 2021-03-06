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
    
    // This hook collapses the navbar after clicking a link,
    // but only if the nav is expanded. This hides the nav bar nicely
    // on mobile devices after link clicks.
    $(document).on('click','.navbar-collapse.in',function(e) {
      if( $(e.target).is('a') ) {
        $(this).collapse('hide');
      }
    });

    // Replay a known game number
    ui.bindToEvent('game-ui-replay', 'click', ui.replayGame);
    
    // Play a new (random) game
    ui.bindToEvent('game-ui-new', 'click', ui.playNewGame);

    // Show game history
    ui.bindToEvent('game-ui-history', 'click', ui.showGameHistory);
    
    // Show game rules
    ui.bindToEvent('game-ui-rules', 'click', ui.showGameRules);
    
    // Toggle animation settings
    ui.bindToEvent('game-ui-animations', 'change', ui.toggleAnimations);
    
    // Clear game play history
    ui.bindToEvent('game-ui-clear-history', 'click', game.controller.clearHistory);
    
    // Show the "About" panel
    ui.bindToEvent('game-ui-about-show', 'click', ui.showAboutPanel);
    
    // Hide the "About" panel
    ui.bindToEvent('game-ui-about-hide', 'click', ui.hideAboutPanel);
    
  });
  
  
  /** 
   * Bind a function to an element event.
   */
  ui.bindToEvent = function(elementId, event, callback) {
    var el = document.getElementById(elementId);
    el.addEventListener(event, callback);
  };
  
  /**
   * Start a default game.
   */
  ui.startDefaultGame = function() {
    if (!game.controller.gameName) {
      game.ui.initialize('klondike');
    }
  };
  
  /**
   * Replay a game.
   */
  ui.replayGame = function() {
    ui.scrollToView();
    var el = document.getElementById('game-number');
    ui.initialize(null, parseInt(el.value));
  };
  
  /**
   * Play new game.
   */
  ui.playNewGame = function() {
    ui.scrollToView();
    ui.initialize();
  };
  
  /**
   * Show the "About" panel.
   */
  ui.showAboutPanel = function() {
    $('#game-ui-about').show();
  };
  
  /**
   * Hide the "About" panel.
   */
  ui.hideAboutPanel = function() {
    $('#ui-game-playfield').show();
    $('#game-ui-about').hide();
    ui.startDefaultGame();
    ui.scrollToView();
  };
  
  /**
   * Show the "About" panel.
   */
  ui.showAboutPanel = function() {
    $('#game-ui-about').show();
  };
  
  /**
   * Toggle animations.
   */
  ui.toggleAnimations = function() {
    game.controller.toggleAnimations(this.checked);
  };
  
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
    
    // Hide the history modal if visible (like from replaying a historyical game)
    $('#GameHistoryModal').modal('hide');
    
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
   * Build a menu from all game objects.
   */
  ui.buildGamesMenu = function() {
    var gameNames = Object.keys(game.games);
    var el = document.getElementById('all-games-list');
    gameNames.forEach(function(name) {
      if (name != 'template') {
        var anchor = document.createElement('a');
        anchor.innerHTML = name; //.toUpperCase();
        anchor.setAttribute("onclick", "game.ui.initialize('"+name+"')");
        anchor.setAttribute("href", "#");
        anchor.classList.add('list-group-item');
        el.appendChild(anchor);
      }
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
    
    for (i=game.history.list.length-1; i>=0; i--) {
      addHistoryRow(game.history.list[i]);
    }

    // Display the modal
    $('#GameHistoryModal').modal('show');
    
  };
  
  /**
   * Show the game rules modal.
   */
  ui.showGameRules = function() {
    
    var el = document.getElementById('game-info');
    
    if (!el) return;
    
    el.innerHTML = game.rules.requestRulesWording();

    // Display the modal
    $('#GameRulesModal').modal('show');
    
  };
  
  /**
   * Display the game number.
   */
  ui.displayGameNumber = function(n) {
    var el = document.getElementById('game-number');
    if (el) el.value = n;
  };
  
})();
