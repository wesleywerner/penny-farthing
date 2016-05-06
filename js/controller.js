/**
 * Handles user input.
 * Scope: See the model and view
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var controller = g.controller = { }
  var model = g.model;
  var view = g.view;
  
  /**
   * Initialize controllers for the canvas element.
   */
  controller.initialize = function(canvasElement) {
    
    controller.canvas = canvasElement;
    
    // deal a new game
    game.model.deal();
    
    game.view.initialize(canvasElement);
    
    // Hook into the canvas resize event to retrigger resize calculations
    controller.resizeHandler = function() {
      game.view.resize();
    };

    controller.onResize = function(callback) {
      var windowH = window.innerHeight,
          windowW = window.innerWidth;
      setInterval(function(){
          if( window.innerHeight !== windowH || window.innerWidth !== windowW ){
            windowH = window.innerHeight;
            windowW = window.innerWidth;
            callback();
          }
      }, 600);
    }

    controller.onResize(controller.resizeHandler);
    
    controller.resizeHandler();

    canvasElement.addEventListener("click", function( event ) {
      // The event position is relative to the document.
      // Convert to canvas coordinates.
      var rect = controller.canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      game.view.click(x, y);
    }, false);
    
    /**
     * Card manipulation methods.
     */
     
     
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
      var card = model.cards[zone].get();
      return card || null;
    }
    
    /**
     * Place the given card into a zone.
     * Placing a card into any zone will first remove it from
     * any existing zone it may be in.
     */
    controller.place = function(card, zone) {
      if (card != null) {
        controller.remove(card);
        model.cards[zone].add(card);
        // TODO funcitonzie this draw request
        requestAnimationFrame(view.draw);
      }
    };
    
    /**
     * Remove the given card from all zones
     */
    controller.remove = function(card) {
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
    
    
  };
  
})();
