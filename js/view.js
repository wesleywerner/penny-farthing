/**
 * Handles the drawing of the cards on the table.
 * Scope: Can see the model
 * 
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var v = g.view = { }

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
    v.cardWidth = w * 0.1;
    v.cardHeight = h * 0.15;
  };
  
  /**
   * Builds an array of the model cards, stores their column and rows.
   */
  v.refreshCardsFromModel = function() {

    v.cards = [ ];

    var decks = game.model.decks;

    for (c=0; c < decks.length; c++) {
      
      var cards = decks[c].cards;

      for (r=0; r < cards.length; r++) {
        
        var cardData = { };
        cardData.col = c;
        cardData.row = r;
        cardData.card = cards[r];
        v.cards.push(cardData);
        
      }
      
    }
  };
  
  /**
   * Calculate the position of a card.
   * This method should be overridden by the rules file.
   */
  v.calculateCardPosition = function(card, deckIndex, rowIndex) {
    return [0, 0];
  };
  
  /**
   * Draw a card.
   */
  v.drawCard = function(vcard) {
    
    var card = vcard.card;
    var pos = v.calculateCardPosition(card, vcard.col, vcard.row);
    if (pos == undefined) return;
    var x = pos[0] * v.ctx.canvas.clientWidth;
    var y = pos[1] * v.ctx.canvas.clientHeight;
    
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
