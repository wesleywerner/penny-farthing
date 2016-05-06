/**
 * Handles user input.
 * Scope: See the model and view
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var controller = g.controller = { }
  
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
    
  };
  
})();
