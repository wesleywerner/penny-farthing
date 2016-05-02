/**
 * Handles the drawing of the cards on the table.
 * Scope: Can see the model
 * 
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var v = g.view = { }
  
  /**
   * Define padding ratios.
   */
  v.pad = { };
  v.pad.ratios = {      // ratios to calculate padding values
    top: 0.05,          // on the resize call
    side: 0.05,
    piletop: 0.02
    };
    
  /**
   * Define positions of specific zones for the reserve, foundation, waste.
   */
  v.pos = { };
    
  // Calculate a lookup of the card face positions in the imagemap.
  v.facelookup = { };
  v.facelookup.mapstart = {x:217, y:506};
  v.facelookup.gridsize = {w:104, h:145};
  v.facelookup.gridpad = {w:18, h:18};
  
  var suits = ["C", "H", "S", "D", "JOKER"];
  for (n=0; n<13; n++) {
    suits.forEach(function(suit, row) {
      var name = (n+1).toString() + suit;
      var x = v.facelookup.mapstart.x + (v.facelookup.gridsize.w*n) + (v.facelookup.gridpad.w*n);
      var y = v.facelookup.mapstart.y + (v.facelookup.gridsize.h*row) + (v.facelookup.gridpad.h*row);
      v.facelookup[name] = {x:x, y:y};
    });
  }

  /**
   * Initialise the view's drawing context.
   */
  v.initialize = function(canvasElement) {
    v.element = canvasElement;
    if (canvasElement.getContext) {
      v.ctx = canvasElement.getContext('2d');
      requestAnimationFrame(v.draw);
    }
  };
  
  /**
   * Calculates card sizes and position based on the client size.
   */
  v.resize = function() {
    
    var w = v.element.clientWidth;
    var h = v.element.clientHeight;
    
    // resize the canvas area to match the client area
    v.ctx.canvas.width = w;
    
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
    v.cardHeight = v.cardWidth * 1.4;  // 1.4 is the height ratio of our card images

    // resize the canvas height to n cards
    var vstack = game.rules.verticalStackHeight;
    vstack = vstack == undefined ? 3 : vstack;
    v.ctx.canvas.height = vstack * v.cardHeight;
    
    // split the extra pile space
    v.pad.pileside = Math.ceil(v.cardWidth / game.rules.pilesRequired);
    
    // Calculate specific zones
    var rpos = v.pos.reserve = { };
    rpos.x = v.pad.side;
    rpos.y = h - v.cardHeight;
    
    requestAnimationFrame(v.draw);
  };
  
  v.getPileCardPosition = function(card, col, row) {
    
    /**
     * The card x position
     */
    // The pad between piles (multiplied per column)
    var x = v.pad.pileside * col;
    // add the card size (multiplied per column)
    x += col * v.cardWidth;
    // add the edge padding
    x += v.pad.side;
    
    /**
     * The card y position
     */
    // The vertical space between pile cards (multiplied per column)
    var y = v.pad.piletop * row;
    // add the edge padding
    y += v.pad.top;
    
    return {x:x, y:y};
    
  };
  
  /**
   * Draw a card.
   */
  v.drawCard = function(card, x, y) {
    
    // draw card shape
    if (card.up) {
      var map = v.facelookup[card.name];
      v.ctx.drawImage(document.images[1],
        map.x, map.y, v.facelookup.gridsize.w, v.facelookup.gridsize.h,
        x, y, v.cardWidth, v.cardHeight);
    }
    else {
      v.ctx.fillStyle = "gray";
      v.ctx.drawImage(document.images[0], x, y, v.cardWidth, v.cardHeight);
    }
    
    // name
    if (card.up) {
      v.ctx.font = "16px serif";
      v.ctx.fillStyle = "blue";
      v.ctx.fillText(card.name, x, y+14);
    }

  }

  /**
   * Draw the canvas
   */
  v.draw = function() {
    
    if (!v.ctx) return;
    
    // background
    v.ctx.fillStyle = "green";
    v.ctx.fillRect(0, 0, v.ctx.canvas.clientWidth, v.ctx.canvas.clientHeight);

    // draw piles (translate the canvas padding)
    game.model.piles.forEach(function(pile, col, arr){
      pile.cards.forEach(function(card, row){
        card.pos = v.getPileCardPosition(card, col, row);
        v.drawCard(card, card.pos.x, card.pos.y);
      });
    });
    
    // draw reserve outline
    v.ctx.strokeStyle = "black";
    v.ctx.strokeRect(v.pos.reserve.x, v.pos.reserve.y, v.cardWidth, v.cardHeight);
    
  };
  
  /**
   * Gets the card at position x,y
   */
  v.cardAt = function(x, y) {
    var match = undefined;
    // check the top card in each pile
    game.model.piles.forEach(function(pile){
      var card = pile.get();
      if (card != undefined) {
        if (x > card.pos.x && x < card.pos.x + v.cardWidth &&
            y > card.pos.y && y < card.pos.y + v.cardHeight) {
          match = card;
        }
      }
    }); // forEach
    // TODO match in reserve, foundation
    return match;
  };
  
  /**
   * Accepts a position to click and fires an event with the card
   * and zone it hits.
   */
  v.click = function(x, y) {
    
    // get the card at this position
    var card = v.cardAt(x, y);
    
    // detect zones
    var zone = undefined;
    
    if (x > v.pos.reserve.x && x < v.pos.reserve.x + v.cardWidth &&
        y > v.pos.reserve.y && y < v.pos.reserve.y + v.cardHeight) {
          zone = 'reserve';
    }
    
    v.clickedEvent(zone, card);
    
  };
  
  
  
  /**
   * Define callbacks that can be overwritten by the rules file.
   */
   
  /**
   * Called after the view.click method is called with the hit results.
   */
  v.clickedEvent = function(zone, card) {
    var name = card == undefined ? '' : card.name;
    console.log('click hit in zone ' + zone + ' on card ' + name);
  };
  
})();
