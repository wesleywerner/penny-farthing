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

  controller.onMouseDown = function(event) {
    var pos = controller.translateMouse(event);
    var card = view.cardAt(pos.x, pos.y);
    var zone = view.zoneAt(pos.x, pos.y);
    if (card) {
      card.dragpos = pos;
      view.dragged = {zone:zone, card:card};
      console.log('draggging ' + card.name);
    }
  };


  controller.onMouseMove = function(event) {
    if (view.dragged) {
      var pos = controller.translateMouse(event);
      view.dragged.card.dragpos = pos;
      controller.redraw();
    }
  };

  controller.onMouseUp = function(event) {
    var pos = controller.translateMouse(event);
    var card = view.cardAt(pos.x, pos.y);
    var zone = view.zoneAt(pos.x, pos.y);
    if (view.dragged) {
      game.rules.clickEvent({zone:view.dragged.zone, card:view.dragged.card}, {zone:zone, card:card});
      console.log('released ' + view.dragged.card.name);
      view.dragged = null;
    }
    else {
      game.rules.clickEvent({zone:null, card:null}, {zone:zone, card:card});
    }
    controller.redraw();
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
   * Initialize controllers for the canvas element.
   */
  controller.initialize = function(canvasElement, gamename) {
    
    game.ui.reset();
    controller.canvas = canvasElement;
    
    // Remember the game we are playing
    if (gamename) {
      controller.gameName = gamename;
    }
    
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

    controller.onResize();
    
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

  };

  /**
   * Deal.
   */
  controller.deal = function() {

    game.model.deal(game.rules.dealFunc);

    // ensure that each of the game zones have an initialized hand.
    var layout = game.rules.requestLayout();
    Object.keys(layout.zones).forEach(function(zonename) {
      if (!model.cards[zonename]) {
        model.cards[zonename] = game.deck.new();
      }
    });

    controller.redraw();

  }
  
  /**
   * Redraw.
   */
  controller.redraw = function() {
    view.requestDraw();
  };
  
  /**
   * Takes the top card from a zone.
   * Returns null if no card is available.
   */
  controller.take = function(zone) {
    // taking from piles returns a new pile.
    var pile = model.cards[zone].take();
    if (pile.cards.length == 1) {
      return pile.cards[0];
    }
    else {
      return null;
    }
  }
  
  /**
   * Peek at the top card from a zone.
   * Returns null if no card is available.
   */
  controller.peek = function(zone) {
    // taking from piles returns a new pile.
    if (!model.cards) return null;
    var card = model.cards[zone].get();
    return card || null;
  }
  
  /**
   * Place the given card into a zone.
   * Placing a card into any zone will first remove it from
   * any existing zone it may be in.
   */
  controller.place = function(card, zone) {
    if (!model.cards) return;
    if (card != null) {
      controller.remove(card);
      model.cards[zone].add(card);
      //controller.redraw();
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
   * Returns a card from a pile-array zone by column and row indexes.
   */
  controller.byColRow = function(zone, col, row) {
    var zonepiles = game.model.cards[zone];
    return zonepiles[col-1].cards[row-1];
  };
    
})();
