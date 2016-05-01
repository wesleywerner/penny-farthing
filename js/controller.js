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
    
    canvasElement.addEventListener("click", function( event ) {
      
      // The event position is relative to the document.
      // Convert to canvas coordinates.
      var rect = c.canvas.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      console.log("x: " + x + " y: " + y);
      
    }, false);
  };
  
})();
