/**
 * Handles the drawing of the cards on the table.
 * Scope: Can see the model
 * 
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var v = g.view = { }
  
  v.pad = { };
  v.pad.ratios = {      // ratios to calculate padding values
    top: 0.1,          // on the resize call
    side: 0.1,
    piletop: 0.02
    };

  /**
   * Initialise the view's drawing context.
   */
  v.initialize = function(canvasElement) {
    if (canvasElement.getContext) {
      v.ctx = canvasElement.getContext('2d');
      requestAnimationFrame(v.draw);
    }
  };
  
  /**
   * Calculates card sizes and position based on the client size.
   */
  v.resize = function(w, h) {
    v.width = w;
    v.height = h;
    
    // calculate padding from ratios
    v.pad.top = Math.floor(v.pad.ratios.top * h);
    v.pad.side = Math.floor(v.pad.ratios.side * w);
    v.pad.piletop = Math.floor(v.pad.ratios.piletop * h);
    
    // To calculate the card size, we look at the canvas size
    // and how many piles the rules request.
    // We account for spacing between the piles in the form
    // of one extra pile (which we split evenly between the requested
    // pile amount)
    
    var widthMinusPad = w - v.pad.side * 2;   // includes both sides
    var pilesPlusExtra = game.rules.pilesRequired+1;
    v.cardWidth = Math.floor( widthMinusPad / pilesPlusExtra );
    v.cardHeight = h * 0.15;  // TODO determine card height
    
    // split the extra pile space
    v.pad.pileside = Math.ceil(v.cardWidth / game.rules.pilesRequired);
    
  };
  
  v.getPileCardPosition = function(card, col, row) {
    
    /**
     * The card x position
     */
    // The pad between piles (multiplied per column)
    var x = v.pad.pileside * col;
    // add the card size (multiplied per column)
    x += col * v.cardWidth;
    
    /**
     * The card y position
     */
    // The vertical space between pile cards (multiplied per column)
    var y = v.pad.piletop * row;
    
    card.x = x;
    card.y = y;

  };
  
  /**
   * Draw a pile card.
   */
  v.drawPileCard = function(card, col, row) {
    v.getPileCardPosition(card, col, row);
    v.drawCard(card);
  };
  
  /**
   * Draw a card.
   */
  v.drawCard = function(card) {
    
    // draw card shape
    if (card.up) {
      v.ctx.fillStyle = "white";
    }
    else {
      v.ctx.fillStyle = "gray";
    }
    
    v.ctx.fillRect(card.x, card.y, v.cardWidth, v.cardHeight);
    
    // outline card
    v.ctx.fillStyle = "black";
    v.ctx.strokeRect(card.x, card.y, v.cardWidth, v.cardHeight);
    
    // name
    if (card.up) {
      v.ctx.strokeText(card.name, card.x+2, card.y+20);
    }

  }

  v.draw = function() {
    
    if (!v.ctx) return;
    
    // background
    v.ctx.fillStyle = "green";
    v.ctx.fillRect(0, 0, v.ctx.canvas.clientWidth, v.ctx.canvas.clientHeight);

    // draw piles (translate the canvas padding)
    v.ctx.save();
    v.ctx.translate(v.pad.side, v.pad.top);
    game.model.piles.forEach(function(pile, col, arr){
      pile.cards.forEach(function(card, row){
        v.drawPileCard(card, col, row);
      });
    });
    v.ctx.restore();
    
  };
  
})();
