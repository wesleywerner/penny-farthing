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
 * Handles user input.
 * Scope: See the model and view
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  g.games = { };
  var controller = g.controller = { }
  var model = g.model;
  var view = g.view;
  
  // Flag if handlers have been set up
  controller.handlersAdded = false;

  /**
   * Register game rules with the engine.
   */
  controller.registerGame = function(gameObject) {
    game.games[gameObject.name] = gameObject;
  };

  /**
   * Mouse or Touch down event.
   */
  controller.onMouseDown = function(event) {
    
    // Skip drags on the win screen
    if (view.showWinScreen) return;
    
    // Get the touch position, card and zone
    var pos = controller.translateMouse(event);
    var card = view.cardAt(pos.x, pos.y);
    var zone = view.zoneAt(pos.x, pos.y);
    var column = view.columnAt(pos.x);
    
    if (card) {
      
      // Include the stack of cards on top of the selected card
      var cardsOnTop = [card].concat(controller.getCardsOnTopOf(zone, card));
      
      // Consult the rules if we can do this drag
      if (game.rules.allowDragEvent({zone:zone, cards:cardsOnTop})) {
        view.dragged = {zone:zone, pos:pos, cards:cardsOnTop, column:column};
      };
    }
  };


  /**
   * Mouse or Touch move event.
   */
  controller.onMouseMove = function(event) {
    if (view.dragged) {
      var pos = controller.translateMouse(event);
      view.dragged.pos = pos;
      controller.redraw();
    }
  };

  /**
   * Mouse or Touch up event.
   */
  controller.onMouseUp = function(event) {
    
    var pos = controller.translateMouse(event);
    var card = view.cardAt(pos.x, pos.y);
    var zone = view.zoneAt(pos.x, pos.y);
    var column = view.columnAt(pos.x);
    
    // If the zone is a tableau-like layout, try get the card
    // at the grid column.
    if (column != null && !card) {
      card = controller.peekByCol(zone, column);
    }
    
    if (view.dragged) {
      
      // Count this touch
      controller.playerTouches++;
      
      // Notify rules only of valid drops
      if (column != null) {
        
        // Event Dragged and Drop parameters
        var draggedParameter = {
          zone:view.dragged.zone,
          cards:view.dragged.cards,
          column:view.dragged.column
          };
        
        var droppedParameter = {
          zone:zone,
          card:card,
          column:column
          };
        
        // Fire rules drop event
        game.rules.dropEvent(draggedParameter, droppedParameter);
        
      }
      
      // Clear the dragged view object
      view.dragged = null;
      
    }
    else {
      game.rules.dropEvent({zone:null, cards:[]}, {zone:zone, card:card});
    }
    game.view.calculateCardPositions();
    
    // Up events usually trigger card movements, so indicate to the redraw to expect animations.
    controller.redraw(true);
  };
  
  controller.onMouseCancel = function(event) {
    view.dragged = null;
    controller.redraw();
  };
  
  controller.onClick = function(event) {
    var pos = controller.translateMouse(event);
    game.view.click(pos.x, pos.y);
  };
  
  /**
   * Translate the event position relative to the document.
   */
  controller.translateMouse = function(event) {
    var rect = controller.canvas.getBoundingClientRect();
    if (event.type == 'touchstart' || event.type == 'touchmove' || event.type == 'touchend') {
      // prevent this touch from propagating through as a mouse click event
      event.preventDefault();
      var x = event.changedTouches[0].clientX - rect.left;
      var y = event.changedTouches[0].clientY - rect.top;
    }
    else if (event.type == 'mousedown' || event.type == 'mouseup' || event.type == 'mousemove') {
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
    }
    return {x:x, y:y};
  };

  
  // Hook into the canvas resize event to retrigger resize calculations
  controller.onResize = function() {
    game.view.resize();
  };

  controller.onResizeLimiter = function(callback) {
    var windowH = window.innerHeight,
        windowW = window.innerWidth;
    setInterval(function(){
        if( window.innerHeight !== windowH || window.innerWidth !== windowW ){
          windowH = window.innerHeight;
          windowW = window.innerWidth;
          callback();
        }
    }, 600);
  };

  /**
   * Reseed the deck.
   */
  controller.reseed = function(seed) {
    controller.seed = seed || Math.floor( Math.random() * 1000 );
    game.lcg.setSeed(controller.seed);
  };
  
  /**
   * Initialize controllers for the canvas element.
   */
  controller.initialize = function(canvasElement, gamename, seed) {
    
    // Set the game seed
    controller.reseed(seed);

    // Store the canvas element
    controller.canvas = canvasElement;
    
    // Remember the game we are playing
    if (gamename) {
      controller.gameName = gamename;
    }
    
    // If the previous game had a history reference, and the player
    // did not touch the playfield much, remove it from history.
    if (controller.gameHistoryRef != null) {
      if (controller.playerTouches < 10) {
        game.history.remove(controller.gameHistoryRef);
        controller.gameHistoryRef = null;
      }
    };
    
    // Clear the touch count
    controller.playerTouches = 0;    

    // Record to history
    controller.gameHistoryRef = game.history.new(game.controller.gameName, controller.seed);
    
    // Reload the current game
    if (!gamename) {
      gamename = controller.gameName;
    }
    
    // default to the first game if none set
    if (!game.games[gamename]) {
      alert('No game named ' + gamename);
    }
    else {
      game.rules = game.games[gamename];
    }
    
    // Initialize the game view.
    game.view.initialize(canvasElement);

    if (!controller.handlersAdded) {
      controller.handlersAdded = true;
      controller.onResizeLimiter(controller.onResize);

      canvasElement.addEventListener("mousedown", controller.onMouseDown, false);
      canvasElement.addEventListener("mouseup", controller.onMouseUp, false);
      canvasElement.addEventListener("mousemove", controller.onMouseMove, false);

      canvasElement.addEventListener("touchstart", controller.onMouseDown, false);
      canvasElement.addEventListener("touchend", controller.onMouseUp, false);
      canvasElement.addEventListener("touchcancel", controller.onMouseCancel, false);
      canvasElement.addEventListener("touchmove", controller.onMouseMove, false);

    };
    
    game.rules.setup();
    
    // Call view resize so that it recalculates the zones and card positions.
    controller.onResize();

  };

  /**
   * Deal.
   */
  controller.deal = function() {

    var layout = game.rules.requestLayout();
    
    game.model.deal(game.rules.requestDeal, Object.keys(layout.zones));
    
    // Tell the view to begin animating
    view.showWinScreen = false;
    controller.redraw(true);

  }
  
  /**
   * Set the game as won.
   */
  controller.won = function() {
    
    // Flag won in history
    if (controller.gameHistoryRef) {
      game.history.markWon(controller.gameHistoryRef);
      controller.gameHistoryRef = null;
    }
    
    view.showWinScreen = true;
  };
  
  /**
   * Redraw.
   */
  controller.redraw = function(mayRequireAnimation) {
    if (mayRequireAnimation) {
      view.animationsRunning = true;
    }
    view.requestDraw();
  };
  
  /**
   * Takes the top card from a zone.
   * Returns null if no card is available.
   */
  controller.take = function(zone, amount) {
    // taking from piles returns a new pile.
    var pile = model.cards[zone].take(amount);
    if (pile.cards.length == 1) {
      return pile.cards[0];
    }
    if (pile.cards.length > 1) {
      return pile;
    }
    else {
      return null;
    }
  }
  
  /**
   * Place the given card into a zone.
   * Placing a card into any zone will first remove it from
   * any existing zone it may be in.
   */
  controller.place = function(card, zone, col) {
    
    if (!model.cards) return;
    
    if (card != null) {
    
      // Remove card from current zone
      controller.remove(card);
      
      var zonePile = model.cards[zone];
      
      if (zonePile.isStack) {
        zonePile.add(card);
      }
      else if (zonePile.isLadder) {
        zonePile[col].add(card);
      }
      
    }
  };
  
  /**
   * Remove the given card from all zones
   */
  controller.remove = function(card) {
    if (!model.cards) return;
    if (card != null) {
      
      Object.keys(game.model.cards).forEach(function(zone){
      
        var zonecards = model.cards[zone];
        if (zonecards.length) {
          // an array of piles
          zonecards.forEach(function(pile){
            pile.remove(card);
          });
        }
        else {
          // a single pile
          zonecards.remove(card);
        }

      });

    }
  };
  
  /**
   * Peek at the top card from a zone.
   * Returns null if no card is available.
   */
  controller.peekByPile = function(zone) {
    var zonepile = game.model.cards[zone];
    if (zonepile.isStack) {
      return zonepile.get();
    }
    return null;
  }
  
  /**
   * Get a card from a pile-array zone by column and row indexes.
   */
  controller.peekByRow = function(zone, col, row) {
    var zonepile = game.model.cards[zone];
    if (zonepile.isLadder) {
      return zonepile[col].get(row);
    }
    return null;
  };
  
  /**
   * Get a card from a pile-array zone by column
   */
  controller.peekByCol = function(zone, col) {
    var zonepile = game.model.cards[zone];
    if (zonepile.isLadder) {
      return zonepile[col].get();
    }
    return null;
  };
  
  /**
   * Get the stack of cards on top of this given card.
   * This only works for cards in a tableau layout.
   */
  controller.getCardsOnTopOf = function(zone, card) {
    
    var stack = [ ];
    
    // If this card is in a tableau with rows and columns
    if (card.pos.col != null) {
      var column = game.model.cards[zone][card.pos.col].cards;
      for (i=card.pos.row+1; i<column.length; i++) {
        stack.push(column[i]);
      }
    
    }
    
    return stack;
  };
  
  /**
   * Toggle animations on and off.
   */
  controller.toggleAnimations = function(state) {
    view.animate = (state ? true : false);
  };
  
  /**
   * Clear game play history.
   */
  controller.clearHistory = function() {
    if (confirm('Do you *really* want to clear your game play history?')) {
      game.history.clear();
      controller.gameHistoryRef = null;
      alert('History cleared. Your next game onwards will be recorded.');
      return true;
    };
  };
  
})();
