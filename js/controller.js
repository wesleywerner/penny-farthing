/**
 * Handles user input.
 * Scope: See the model and view
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var c = g.controller = { }
  
  /**
   * Initialize controllers for the canvas element.
   */
  c.initialize = function(canvasElement) {
    
    c.canvas = canvasElement;
    
    // deal a new game
    game.model.deal();
    
    game.view.initialize(canvasElement);
    
    // Hook into the canvas resize event to retrigger resize calculations
    c.resizeHandler = function() {
      game.view.resize();
    };

    c.onResize = function(callback) {
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

    c.onResize(c.resizeHandler);
    
    c.resizeHandler();

    canvasElement.addEventListener("click", function( event ) {
      // The event position is relative to the document.
      // Convert to canvas coordinates.
      var rect = c.canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      game.view.click(x, y);
    }, false);
    
  };
  
})();
