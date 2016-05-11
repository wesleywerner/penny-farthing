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
    top: 0.05,          // on the resize call
    side: 0.05,
    piletop: 0.2,
    pileside: 0.02,
    stack: 0.01,       // x-offset of stacked cards
    };
    
  /**
   * Define sizes.
   */
  view.size = { };
  view.size.ratios = {
    font: 0.03,
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
      var grid = view.grid.cells[zone.col-1][zone.row-1];
      zone.x = grid.x;
      zone.y = grid.y;
      zone.w = Math.floor(zone.width*view.size.card.width + (zone.width-1)*view.pad.pileside);
      zone.h = Math.floor(zone.height*view.size.card.height + (zone.height-1)*view.pad.piletop);
      // find the center of each zone
      zone.cenx = zone.x + zone.w/2;
      zone.ceny = zone.y + zone.h/2;
    });
    
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
   * Get the faces imagemap.
   */
  view.image = function(name) {
    
    if (!view.images[name]) {
      view.images[name] = document.images.namedItem(name);
    };
    
    return view.images[name] || null;
    
  };
  
  /**
   * Draw a card back
   */
  view.drawCardBack = function(x, y) {
    if (view.image('cardback')) {
      view.ctx.drawImage(view.image('cardback'), x, y, view.size.card.width, view.size.card.height);
    }
    else {
      view.ctx.fillStyle = "gray";
      view.ctx.fillRect(x, y, view.size.card.width, view.size.card.height);
    }
  };
  
  /**
   * Draw a card.
   */
  view.drawCard = function(card, x, y) {
    
    if (card == undefined) return;
    
    // draw card shape
    if (card.up) {
      var map = view.facelookup[card.name];
      if (!map || !view.image('faces')) {
        view.ctx.fillStyle = "white";
        view.ctx.fillRect(x, y, view.size.card.width, view.size.card.height);
      }
      else {
        view.ctx.drawImage(view.image('faces'),
          map.x, map.y, view.facelookup.gridsize.w, view.facelookup.gridsize.h,
          x, y, view.size.card.width, view.size.card.height);
      }
    }
    else {
      view.drawCardBack(x, y);
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
      
      // Determine if the cards are in one pile (stack), or an array of piles (ladder)
      var isStack = zoneCards.cards;
      var isLadder = !isStack && zoneCards.length > 0;
      
      // Store the zone card state
      zoneCards.isStack = isStack;
      zoneCards.isLadder = isLadder;
      
      if (isStack) {
        zoneCards.cards.forEach(eachStackCard, zone);
      }
      else if (isLadder) {
        zoneCards.forEach(eachPile, zone);
      }
  
    }
    
    Object.keys(view.layout.zones).forEach(eachZone);
    
  };

  /**
   * Draw the canvas
   */
  view.draw = function() {
    
    if (!view.ctx) return;
    
    // Reset alpha
    view.ctx.globalAlpha = 1;
    
    // background
    view.ctx.fillStyle = "green";
    view.ctx.fillRect(0, 0, view.width, view.height);

    // draw zones
    // TODO predraw this loop to an off screen images for blitting here
    Object.keys(view.layout.zones).forEach(function(zonename) {
      
      var zone = view.layout.zones[zonename];
      
      // outline
      view.ctx.fillStyle = 'darkgreen';
      view.ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      
      // title
      view.ctx.fillStyle = 'green';
      view.ctx.textAlign = 'center';
      view.ctx.font = view.size.font.toString() + 'px serif';
      view.ctx.fillText(zonename, zone.cenx, zone.ceny);
      
    });
    
    if (!game.model.cards) return;
    
    // Request another animation loop while any cards are moving.
    var mustAnimate = false;
    
    // Draw each card for every zone
    var eachZonePile = function(zoneName) {
      var zoneCards = game.model.cards[zoneName];
      if (zoneCards.isStack) {
        zoneCards.cards.forEach(function(card, index){
          if (view.updateDrawPosition(card)) mustAnimate = true;
          view.drawCard(card, card.drawpos.x, card.drawpos.y);
        });
      }
      else if (zoneCards.isLadder) {
        zoneCards.forEach(function(ladder, col){
          ladder.cards.forEach(function(card, row){
            if (view.updateDrawPosition(card)) mustAnimate = true;
            view.drawCard(card, card.drawpos.x, card.drawpos.y);
          });
        });
      }
    };
    
    Object.keys(game.model.cards).forEach(eachZonePile);
    
    // Dragging a stack of cards
    if (view.dragged) {
      view.ctx.globalAlpha = 0.5;
      view.dragged.cards.forEach(function(card, row) {
        view.drawCard(card,
          view.dragged.pos.x - view.size.card.center.x,
          view.dragged.pos.y - view.size.card.center.y + (row*view.pad.piletop)
          );
      });
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
    if (view.animate && mustAnimate) view.requestDraw();

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
  
})();
