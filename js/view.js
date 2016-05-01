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
   * The view keeps an array of cards positions with a reference
   * back to the card data.
   */
  v.cards = null;
  
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
  
  /**
   * Builds an array of the model cards, stores their column and rows.
   */
  v.refreshCardsFromModel = function() {

    v.cards = [ ];

    // calculate pile positions
    var decks = game.model.piles;

    for (c=0; c < decks.length; c++) {
      
      var cards = decks[c].cards;

      for (r=0; r < cards.length; r++) {
        
        /**
         * The card x position
         */
        // start at the canvas pad
        var x = v.pad.side;
        // add the pad between piles (multiplied per column)
        x += v.pad.pileside * c;
        // add the card size (multiplied per column)
        x += c * v.cardWidth;
        
        /**
         * The card y position
         */
        // start at the canvas pad
        var y = v.pad.top;
        // add the pad between piles (multiplied per column)
        y += v.pad.piletop * r;

        //y = r * 6;
        
        var cardData = { };
        cardData.x = x;
        cardData.y = y;
        //cardData.col = c;
        //cardData.row = r;
        cardData.card = cards[r];
        v.cards.push(cardData);
        
      }
      
    }
  };
  
  /**
   * Draw a card.
   */
  v.drawCard = function(vcard) {
    
    var card = vcard.card;
    var x = vcard.x;
    var y = vcard.y;
    
    // draw card shape
    if (card.up) {
      v.ctx.fillStyle = "white";
    }
    else {
      v.ctx.fillStyle = "gray";
    }
    
    v.ctx.fillRect(x, y, v.cardWidth, v.cardHeight);
    
    // outline card
    v.ctx.fillStyle = "black";
    v.ctx.strokeRect(x, y, v.cardWidth, v.cardHeight);
    
    // name
    if (card.up) {
      v.ctx.strokeText(card.name, x+2, y+20);
    }

  }

  v.draw = function() {
    
    if (!v.ctx) return;
    
    // background
    v.ctx.fillStyle = "green";
    v.ctx.fillRect(0, 0, v.ctx.canvas.clientWidth, v.ctx.canvas.clientHeight);

    v.cards.forEach(v.drawCard);
    
    //// draw piles
    //game.model.piles.forEach(function(pile, index, arr){
      //pile.cards.forEach(v.drawcard);
      //});
    
  };

  v.draw_v1 = function() {
    if (v.ctx) {

      //requestAnimationFrame(v.draw);

      var decks = game.model.decks;
      
      // background
      v.ctx.fillStyle = "green";
      v.ctx.fillRect(0, 0, v.ctx.canvas.clientWidth, v.ctx.canvas.clientHeight);

      v.ctx.save();

      // if needed: transform position before any cards are drawn

      for (c=1; c < decks.length; c++) {

        v.ctx.save();
        // transform position for this column
        v.ctx.translate(c * v.cardWidth, 20);
        // padding between columns
        v.ctx.translate(c*20, 0);
        
        var cards = decks[c].cards;

        for (i=0; i < cards.length; i++) {

          // transform position for this card
          v.ctx.save();
          v.ctx.translate(3*i, i*20);
          
          v.drawCard(cards[i]);

          v.ctx.restore();
          
        }

        v.ctx.restore();
        
      }

      v.ctx.restore();
      
    }
  };
  
})();
