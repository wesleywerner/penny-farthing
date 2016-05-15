/**
 * Handles the drawing of the cards on the table.
 * Scope: Can see the model
 * 
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var view = g.view = { }
  
  // Enable moving card animations. Turn this off to save processing.
  view.animate = true;
  
  // Limit animation requests to one at a time.
  view.hasAnimationRequest = false;
  
  /**
   * Define padding ratios.
   */
  view.pad = { };
  view.pad.ratios = {      // ratios to calculate padding values
    top: 0.02,          // on the resize call
    side: 0.02,
    piletop: 0.2,
    pileside: 0.02,
    stack: 0.005,       // x-offset of stacked cards
    };
    
  /**
   * Define sizes.
   */
  view.size = { };
  view.size.ratios = {
    font: 0.025,
    cardZoom: 1.5
  }
  
  /**
   * Stores loaded images.
   */
  view.images = { };
  
  /**
   * Stores the grid positions for card columns and rows.
   * Calculated on resize.
   */
  view.grid = null;
  
  // Calculate a lookup of the card face positions in the imagemap.
  view.facelookup = { };
  view.facelookup.mapstart = {x:216, y:506};
  view.facelookup.mapjokerstart = {x:216, y:1159};
  view.facelookup.gridsize = {w:104, h:145};
  view.facelookup.gridpad = {w:18, h:18};
  
  var suits = ["C", "H", "S", "D"];
  for (n=0; n<13; n++) {
    suits.forEach(function(suit, row) {
      var name = (n+1).toString() + suit;
      var x = view.facelookup.mapstart.x + (view.facelookup.gridsize.w*n) + (view.facelookup.gridpad.w*n);
      var y = view.facelookup.mapstart.y + (view.facelookup.gridsize.h*row) + (view.facelookup.gridpad.h*row);
      view.facelookup[name] = {x:x, y:y};
    });
  }
  
  // insert the joker cards
  for (n=0; n<3; n++) {
      var name = (n+101).toString() + 'JOKER';
      var x = view.facelookup.mapjokerstart.x + (view.facelookup.gridsize.w*n) + (view.facelookup.gridpad.w*n);
      var y = view.facelookup.mapjokerstart.y;
      view.facelookup[name] = {x:x, y:y};
  }

  /**
   * Initialise the view's drawing context.
   */
  view.initialize = function(canvasElement) {
    view.element = canvasElement;
    if (canvasElement.getContext) {
      view.ctx = canvasElement.getContext('2d');
      requestAnimationFrame(view.draw);
    }
  };
  
  /**
   * Calculates card sizes and position based on the client size.
   */
  view.resize = function() {
    
    // Request the rules layout
    view.layout = game.rules.requestLayout();
    
    view.layout.victory = view.layout.victory || {text:'Victory', color:'yellow', card:'101JOKER'};
    
    var w = view.element.clientWidth;
    var h = view.element.clientHeight;
    
    // The height is neglible at this point.
    // We calculate the card width first based on how many piles
    // the rules request. Then we work out the height of a card
    // and only then do we calculate the height of the canvas.
    
    // resize the canvas area to match the client area
    view.ctx.canvas.width = view.width = w;
    
    // scale font
    view.size.font = Math.floor( view.size.ratios.font * w );
    
    // padding via preset ratios
    view.pad.side = Math.floor(view.pad.ratios.side * w);
    view.pad.pileside = Math.floor(view.pad.ratios.pileside * w);

    // To calculate the card size, we look at the canvas size
    // and how many columns the rules request.
    // We account for padding between the piles.
    var stackRows = view.layout.columnsRequested;
    var widthMinusPad = w - view.pad.side * 2 - view.pad.pileside * stackRows;
    view.size.card = {};
    view.size.card.width = Math.floor( widthMinusPad / stackRows );
    view.size.card.height = Math.floor(view.size.card.width * 1.4);  // 1.4 is the height ratio of our card images
    view.size.card.center = {x:Math.floor(view.size.card.width/2), y:Math.floor(view.size.card.height/2)};
    view.size.card.zoom = {w:view.size.card.width*view.size.ratios.cardZoom, h:view.size.card.height*view.size.ratios.cardZoom}

    // resize the canvas height to n cards
    var stackRows = view.layout.rowsRequested;
    stackRows = stackRows == undefined ? 3 : stackRows;
    var stackHeight = stackRows * view.size.card.height;
    
    // vertical padding now that we have our height
    view.pad.top = Math.floor(view.pad.ratios.top * h);
    view.pad.piletop = Math.floor(view.pad.ratios.piletop * view.size.card.height);
    view.pad.stack = Math.floor(view.pad.ratios.stack * h);

    // Resize the canvas height
    // Include the top padding and padding between rows of cards
    var stackPadding = (view.pad.top * 2) + (view.pad.piletop * stackRows);
    view.ctx.canvas.height = h = view.height = Math.floor(stackHeight + stackPadding);

    // The grid positions
    view.grid = { };
    view.grid.cells = [ ];
    view.grid.cols = view.layout.columnsRequested;
    view.grid.rows = view.layout.rowsRequested;
    
    for (col=0; col < view.grid.cols; col++) {
      for (row=0; row < view.grid.rows; row++) {

        /**
         * The card x position
         */
        // The pad between piles (multiplied per column)
        var x = view.pad.pileside * col;
        // add the card size (multiplied per column)
        x += col * view.size.card.width;
        // add the edge padding
        x += view.pad.side;
        
        /**
         * The card y position
         */
        // The vertical space between pile cards (multiplied per column)
        var y = view.pad.piletop * row;
        // add the card size (multiplied per row)
        y += row * view.size.card.height;
        // add the edge padding
        y += view.pad.top;
      
        // initialise array
        view.grid.cells[col] = view.grid.cells[col] == undefined ? [] : view.grid.cells[col];
        view.grid.cells[col][row] = {x:x, y:y};
      }
    }
    
    // Calculate zone positions from grid positions
    Object.keys(view.layout.zones).forEach(function(zonename) {
      var zone = view.layout.zones[zonename];
      var col = zone.col-1;
      var row = zone.row-1;
      if (col >= view.grid.cells.length) {
        console.log('Check your zone definition. The grid does not have a column ' + zone.col);
        return;
      }
      if (row >= view.grid.cells[col].length) {
        console.log('Check your zone definition. The grid does not have a row ' + zone.row);
        return;
      }
      var grid = view.grid.cells[col][row];
      zone.x = grid.x;
      zone.y = grid.y;
      zone.w = Math.floor(zone.width*view.size.card.width + (zone.width-1)*view.pad.pileside);
      zone.h = Math.floor(zone.height*view.size.card.height + (zone.height-1)*view.pad.piletop);
      // find the center of each zone
      zone.cenx = zone.x + zone.w/2;
      zone.ceny = zone.y + zone.h/2;
    });
    
    // Recalculate card positions
    view.calculateCardPositions();
    
    // Prerender the background
    view.predrawBackground();
    
    // Prerender victory image
    view.predrawVictory();
    
    // Prerender cards to set up the canvas initially
    view.predrawCards();
    
    // Assume we need to animate cards into their new positions
    view.animationsRunning = true;
    
    // Request to redraw
    requestAnimationFrame(view.draw);
  };
  
  /**
   * Adds a zone by grid column and row.
   */
  view.addZoneFunc = function(name, col, row, width, height) {
    var grid = view.grid.cells[col-1][row-1];
    if (grid == undefined) return;
    zone = {
      name:name,
      x:grid.x,
      y:grid.y,
      w:Math.floor(width*view.size.card.width),
      h:Math.floor(height*view.size.card.height)
    };
    view.zones.push(zone);
  };
  
  /**
   * Get a document image
   */
  view.image = function(name) {
    
    if (!view.images[name]) {
      view.images[name] = document.images.namedItem(name);
    };
    
    return view.images[name] || null;
    
  };
    
  /**
   * Draw a card.
   * Zoom indicates a close-up of a card (likely a touch dragged card)
   * And we draw it scaled up, and offset for a better view.
   */
  view.drawCard = function(context, card, x, y, zoom) {
    
    if (card == undefined) return;
    
    var w = zoom ? view.size.card.zoom.w : view.size.card.width;
    var h = zoom ? view.size.card.zoom.h : view.size.card.height;
    var offset = zoom ? view.size.card.zoom.w : 0;
    
    // draw card shape
    if (card.up) {
      var map = view.facelookup[card.name];
      if (!map || !view.image('faces')) {
        context.fillStyle = "white";
        context.fillRect(x, y, w, h);
      }
      else {
        context.drawImage(view.image('faces'),
          map.x, map.y,
          view.facelookup.gridsize.w,
          view.facelookup.gridsize.h,
          x-offset, y, w, h
          );
      }
    }
    else {
      
      // draw the card back
      if (view.image('cardback')) {
        context.drawImage(view.image('cardback'), x, y, view.size.card.width, view.size.card.height);
      }
      else {
        context.fillStyle = "gray";
        context.fillRect(x, y, view.size.card.width, view.size.card.height);
      }
      
    }

  }
  
  /**
   * Request an animation frame.
   */
  view.requestDraw = function() {
    if (!view.hasAnimationRequest) {
      view.hasAnimationRequest = true;
      requestAnimationFrame(view.draw);
    }
  };
  
  /**
   * Predraw victory screen.
   */
  view.predrawVictory = function() {
    
    if (!view.victoryCanvas) {
      view.victoryCanvas = document.createElement('canvas');
    };
    
    view.victoryCanvas.width = w = view.element.clientWidth;
    view.victoryCanvas.height = h = view.element.clientHeight;
    
    var ctx = view.victoryCanvas.getContext('2d');
    
    if (!ctx) {
      console.log('no context received for drawing the victory canvas');
      return;
    }
    
    // shaded overlay
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, view.element.clientWidth, view.element.clientHeight);
    
    // wording
    var victoryText = view.layout.victory.text;
    
    // scale font to screen
    var ratio = 70 / 600;
    var fontSize = w * ratio;
    var cardRatio = 1.5;
    var cardWidth = view.size.card.width * cardRatio;
    var cardHeight = view.size.card.height * cardRatio;
    
    // center text
    w=w/2;
    h=h/2;
    
    ctx.font = (fontSize|20)+'px serif';
    ctx.textAlign = 'center';

    // shadow
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = 'black';
    ctx.fillText(victoryText, w+4, h+4);

    ctx.globalAlpha = 1;

    // outline
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(victoryText, w, h);
    
    // text
    ctx.fillStyle = view.layout.victory.color;
    ctx.fillText(victoryText, w, h);
    
    // card face
    var map = view.facelookup[view.layout.victory.card];
    if (map) {
      ctx.save();
      ctx.translate(w, h);
      ctx.rotate(Math.PI / 5);
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.strokeRect(-1, -1, cardWidth, cardHeight);
      ctx.globalAlpha = 1;
      ctx.drawImage(view.image('faces'),
            map.x, map.y,
            view.facelookup.gridsize.w,
            view.facelookup.gridsize.h,
            0, 0,
            cardWidth, cardHeight
            );
      ctx.restore();
    }

  };
  
  /**
   * Predraw the background image
   */
  view.predrawBackground = function() {
    
    if (!view.backgroundCanvas) {
      view.backgroundCanvas = document.createElement('canvas');
    };
    
    view.backgroundCanvas.width = view.element.clientWidth;
    view.backgroundCanvas.height = view.element.clientHeight;
    
    var ctx = view.backgroundCanvas.getContext('2d');
    
    if (!ctx) {
      console.log('no context received for drawing the background image');
      return;
    }
    
    // background
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, view.width, view.height);

    // iterate over the game zones
    Object.keys(view.layout.zones).forEach(function(zonename) {
      
      var zone = view.layout.zones[zonename];

      var storedAlpha = view.ctx.globalAlpha;
      
      // fill
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = zone.tint || '#000';
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      ctx.globalAlpha = storedAlpha;
      
      // outline
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 6;
      ctx.strokeStyle = zone.tint || '#090';
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.globalAlpha = storedAlpha;
      
      // title
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.font = view.size.font.toString() + 'px serif';
      ctx.fillText(zonename, zone.cenx, zone.ceny);
      
      ctx.globalAlpha = storedAlpha;
    });
    
  };
  
  /**
   * Calculate the positions of cards based on the zone they are in.
   */
  view.calculateCardPositions = function() {
    
    if (!game.model.cards) return;
    
    var eachStackCard = function(card, index){
      
      // 'this' is the zone object
      var zone = this;
      
      // offset x to give a pile like effect
      var x = zone.x - Math.min(index, 3) *view.pad.stack;
      var y = zone.y;
      
      // store the card position
      card.pos = {x:x, y:y, col:null, row:null};
      
      // set the draw position
      card.drawpos = card.drawpos || {x:view.element.clientWidth/2, y:0};

    };
    
    var eachPile = function(pile, col) {
      
      // 'this' is the zone object
      var zone = this;
      
      pile.cards.forEach(function(card, row){
        
        // position for each column.
        var x = zone.x + (col*view.pad.pileside) + (col*view.size.card.width);
        
        // offset y for a stack like effect
        var y = zone.y + (row * view.pad.piletop);
        
        // store the card position
        card.pos = {x:x, y:y, col:col, row:row};
        
        // set the draw position
        card.drawpos = card.drawpos || {x:view.element.clientWidth/2, y:0};
        
      });
    };
    
    var eachZone = function(zonename) {
      
      // Get the zone definition
      var zone = view.layout.zones[zonename];
      
      // Get the cards linked to this zone
      var zoneCards = game.model.cards[zonename];
      
      if (zoneCards.isStack) {
        zoneCards.cards.forEach(eachStackCard, zone);
      }
      else if (zoneCards.isLadder) {
        zoneCards.forEach(eachPile, zone);
      }
  
    }
    
    Object.keys(view.layout.zones).forEach(eachZone);
    
  };
  
  /**
   * Predraw the cards on to a canvas.
   * Returns true if any cards are still animating.
   */
  view.predrawCards = function() {
    
    if (!view.cardsCanvas) {
      view.cardsCanvas = document.createElement('canvas');
    };
    
    view.cardsCanvas.width = view.element.clientWidth;
    view.cardsCanvas.height = view.element.clientHeight;
    
    var ctx = view.cardsCanvas.getContext('2d');
    
    if (!ctx) {
      console.log('no context received for drawing the cards canvas');
      return;
    }
    
    // Request another animation loop while any cards are moving.
    var mustAnimate = false;
    
    // Draw each card for every zone
    var eachZonePile = function(zoneName) {
      var zoneCards = game.model.cards[zoneName];
      if (zoneCards.isStack) {
        zoneCards.cards.forEach(function(card, index){
          if (view.updateDrawPosition(card)) mustAnimate = true;
          view.drawCard(ctx, card, card.drawpos.x, card.drawpos.y);
        });
      }
      else if (zoneCards.isLadder) {
        zoneCards.forEach(function(ladder, col){
          ladder.cards.forEach(function(card, row){
            if (view.updateDrawPosition(card)) mustAnimate = true;
            view.drawCard(ctx, card, card.drawpos.x, card.drawpos.y);
          });
        });
      }
    };
    
    Object.keys(game.model.cards).sort().reverse().forEach(eachZonePile);
    
    return mustAnimate;
    
  };

  /**
   * Draw the canvas
   */
  view.draw = function() {
    
    if (!view.ctx) return;
    
    // Reset alpha
    view.ctx.globalAlpha = 1;
    
    // Draw background
    view.ctx.drawImage(view.backgroundCanvas, 0, 0);
    
    if (!game.model.cards) return;
    
    // Redraw the cards image buffer.
    // Store if there are animating cards, to request another redraw.
    if (view.animationsRunning) {
      view.animationsRunning = view.predrawCards();
    }
    
    // Draw the cards image buffer
    view.ctx.drawImage(view.cardsCanvas, 0, 0);
    
    // Dragging a stack of cards
    if (view.dragged) {
      
      // Transparent dragging
      view.ctx.globalAlpha = 0.8;
      
      // Multiple cards involved
      view.dragged.cards.forEach(function(card, row) {
        
        // Draw the dragged card at the dragging position. Scaled is true.
        view.drawCard(
          view.ctx,
          card,
          view.dragged.pos.x - view.size.card.center.x,
          view.dragged.pos.y - view.size.card.center.y + (row*view.pad.piletop*1.5),
          true
          );
        
      });

      // Draw an arc around the finger/cursor
      view.ctx.strokeStyle = "black";
      view.ctx.lineWidth = 4;
      view.ctx.setLineDash([20, 10]);
      view.ctx.lineDashOffset = -(view.dragged.pos.x + view.dragged.pos.y);
      view.ctx.beginPath();
      view.ctx.arc(view.dragged.pos.x, view.dragged.pos.y, 50, 0, 2 * Math.PI);
      view.ctx.stroke();

    }
    
    if (view.showWinScreen) {
      view.ctx.globalAlpha = 1;
      view.ctx.drawImage(view.victoryCanvas, 0, 0);
    }
    
    //// Grid
    //view.ctx.strokeStyle = 'blue';
    //for (col=0; col < view.grid.cols; col++) {
      //for (row=0; row < view.grid.rows; row++) {
        //view.ctx.strokeRect(
          //view.grid.cells[col][row].x,
          //view.grid.cells[col][row].y,
          //view.size.card.width,
          //view.size.card.height
          //);
      //}
    //}
    
    // Clear animation request flag
    view.hasAnimationRequest = false;
    
    // Request another draw if animations are enable, and there are moving cards
    if (view.animate && view.animationsRunning) view.requestDraw();

  };
  
  /**
   * Update the draw position for cards if animations are enabled,
   * and if not enabled then simply use the current card position.
   */
  view.updateDrawPosition = function(card) {
    if (view.animate) {
      var xDelta = Math.floor(card.pos.x - card.drawpos.x);
      var yDelta = Math.floor(card.pos.y - card.drawpos.y);
      if (xDelta != 0) card.drawpos.x += xDelta * 0.05;
      if (yDelta != 0) card.drawpos.y += yDelta * 0.05;
      return xDelta != 0 || yDelta != 0;
    }
    else {
      card.drawpos = card.pos;
      return false;
    }
  };

  
  /**
   * Get the card at point x,y
   */
  view.cardAt = function(x, y) {
    
    if (!game.model.cards) return null;
    
    // store the card matched under x,y
    var match = undefined;
    
    // scan each zone
    Object.keys(view.layout.zones).forEach(function(zonename) {
      
      var zone = view.layout.zones[zonename];
      var ispile = game.model.cards[zonename].cards != undefined;
      var ismanypiles = !ispile && game.model.cards[zonename].length > 0;
      
      if (ispile) {
        var zonecards = game.model.cards[zonename].cards;
      }
      else if (ismanypiles) {
        var zonepiles = game.model.cards[zonename];
      }
  
      if (ispile) {
        var pilecount = zonecards.length-1;
        zonecards.forEach(function(card, row){
          if (x > card.pos.x && x < card.pos.x + view.size.card.width &&
              y > card.pos.y && y < card.pos.y + view.size.card.height) {
            // store the clicked row on the card
            card.clickedColRow = {col:0, row:row+1};
            card.onTop = row == pilecount;
            match = card;
          }
        });
      }

      if (ismanypiles) {
        // this is an array of piles
        zonepiles.forEach(function(pile, col){
          var pilecount = pile.cards.length-1;
          pile.cards.forEach(function(card, row){
            if (x > card.pos.x && x < card.pos.x + view.size.card.width &&
                y > card.pos.y && y < card.pos.y + view.size.card.height) {
              // store the clicked row and column on the card
              card.clickedColRow = {col:col+1, row:row+1};
              card.onTop = row == pilecount;
              match = card;
            }
          });
        });
      }

    });
    
    return match;
  };
  
  /**
   * Get the zone inside the point x,y.
   */
  view.zoneAt = function(x, y) {
    
    // detect zones
    var match = null;

    Object.keys(view.layout.zones).forEach(function(zonename) {
      var zone = view.layout.zones[zonename];
      if (x > zone.x && x < zone.x + zone.w &&
        y > zone.y && y < zone.y + zone.h) {
          match = zonename;
    }
    });
    
    return match;
    
  };
  
  /**
   * Get the grid column at the given x position.
   */
  view.columnAt = function(x) {
    for (col=0; col < view.grid.cols; col++) {
      var cell = view.grid.cells[col][0];
      if (x > cell.x && x < cell.x+view.size.card.width) {
        return col;
      }
    }
    return null;
  };
  
})();
