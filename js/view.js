/**
 * Handles the drawing of the cards on the table.
 * Scope: Can see the model
 * 
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var view = g.view = { }
  
  /**
   * Define padding ratios.
   */
  view.pad = { };
  view.pad.ratios = {      // ratios to calculate padding values
    top: 0.05,          // on the resize call
    side: 0.05,
    piletop: 0.02,
    pileside: 0.02,
    stack: 0.005,       // x-offset of stacked cards
    };
    
  /**
   * Define sizes.
   */
  view.size = { };
  view.size.ratios = {
    font: 0.03,
  }
  
  /**
   * Stores the grid positions for card columns and rows.
   * Calculated on resize.
   */
  view.grid = null;
  
  // Calculate a lookup of the card face positions in the imagemap.
  view.facelookup = { };
  view.facelookup.mapstart = {x:217, y:506};
  view.facelookup.gridsize = {w:104, h:145};
  view.facelookup.gridpad = {w:18, h:18};
  
  var suits = ["C", "H", "S", "D", "JOKER"];
  for (n=0; n<13; n++) {
    suits.forEach(function(suit, row) {
      var name = (n+1).toString() + suit;
      var x = view.facelookup.mapstart.x + (view.facelookup.gridsize.w*n) + (view.facelookup.gridpad.w*n);
      var y = view.facelookup.mapstart.y + (view.facelookup.gridsize.h*row) + (view.facelookup.gridpad.h*row);
      view.facelookup[name] = {x:x, y:y};
    });
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
    view.cardWidth = Math.floor( widthMinusPad / stackRows );
    view.cardHeight = Math.floor(view.cardWidth * 1.4);  // 1.4 is the height ratio of our card images

    // resize the canvas height to n cards
    var stackRows = view.layout.rowsRequested;
    stackRows = stackRows == undefined ? 3 : stackRows;
    var stackHeight = stackRows * view.cardHeight;
    
    // vertical padding now that we have our height
    view.pad.top = Math.floor(view.pad.ratios.top * h);
    view.pad.piletop = Math.floor(view.pad.ratios.piletop * h);
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
        x += col * view.cardWidth;
        // add the edge padding
        x += view.pad.side;
        
        /**
         * The card y position
         */
        // The vertical space between pile cards (multiplied per column)
        var y = view.pad.piletop * row;
        // add the card size (multiplied per row)
        y += row * view.cardHeight;
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
      zone.w = Math.floor(zone.width*view.cardWidth + (zone.width-1)*view.pad.pileside);
      zone.h = Math.floor(zone.height*view.cardHeight + (zone.height-1)*view.pad.piletop);
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
      w:Math.floor(width*view.cardWidth),
      h:Math.floor(height*view.cardHeight)
    };
    view.zones.push(zone);
  };
  
  /**
   * Draw a card back
   */
  view.drawCardBack = function(x, y) {
    view.ctx.drawImage(document.images[0], x, y, view.cardWidth, view.cardHeight);
  };
  
  /**
   * Draw a card.
   */
  view.drawCard = function(card, x, y) {
    
    if (card == undefined) return;
    
    // draw card shape
    if (card.up) {
      var map = view.facelookup[card.name];
      if (map == undefined) {
        view.ctx.fillStyle = "white";
        view.ctx.fillRect(x, y, view.cardWidth, view.cardHeight);
        view.ctx.font = "12px serif";
        view.ctx.fillStyle = "red";
        view.ctx.fillText('card face image not found', x, y+14);
      }
      else {
        view.ctx.drawImage(document.images[1],
          map.x, map.y, view.facelookup.gridsize.w, view.facelookup.gridsize.h,
          x, y, view.cardWidth, view.cardHeight);
      }
    }
    else {
      view.drawCardBack(x, y);
    }
    
    // name
    if (card.up) {
      view.ctx.font = "16px serif";
      view.ctx.fillStyle = "blue";
      view.ctx.fillText(card.name, x, y+14);
    }

  }

  /**
   * Draw the canvas
   */
  view.draw = function() {
    
    if (!view.ctx) return;
    
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
    
    // Cards
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
        zonecards.forEach(function(card, index){
          // offset x to give a pile like effect
          var x = zone.x-index*view.pad.stack;
          var y = zone.y;
          // store the card position
          card.pos = {x:x, y:y};
          view.drawCard(card, x, y);
        });
      }

      if (ismanypiles) {
        // this is an array of piles
        zonepiles.forEach(function(pile, col){
          pile.cards.forEach(function(card, row){
            // position for each column.
            var x = zone.x + (col*view.pad.pileside) + (col*view.cardWidth);
            // offset y for a stack like effect
            var y = zone.y + (row * view.pad.piletop);
            // store the card position
            card.pos = {x:x, y:y};
            view.drawCard(card, x, y);
          });
        });
      }

    });
    
    // Grid
    view.ctx.strokeStyle = 'blue';
    for (col=0; col < view.grid.cols; col++) {
      for (row=0; row < view.grid.rows; row++) {
        view.ctx.strokeRect(
          view.grid.cells[col][row].x,
          view.grid.cells[col][row].y,
          view.cardWidth,
          view.cardHeight
          );
      }
    }

  };
  
  /**
   * Gets the card at position x,y
   */
  view.cardAt = function(x, y) {
    
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
        zonecards.forEach(function(card, index){
          if (x > card.pos.x && x < card.pos.x + view.cardWidth &&
              y > card.pos.y && y < card.pos.y + view.cardHeight) {
            match = card;
          }
        });
      }

      if (ismanypiles) {
        // this is an array of piles
        zonepiles.forEach(function(pile, col){
          pile.cards.forEach(function(card, index){
            if (x > card.pos.x && x < card.pos.x + view.cardWidth &&
                y > card.pos.y && y < card.pos.y + view.cardHeight) {
              match = card;
            }
          });
        });
      }

    });
    
    return match;
  };
  
  /**
   * Accepts a position to click and fires an event with the card
   * and zone it hits.
   */
  view.click = function(x, y) {
    
    // get the card at this position
    var card = view.cardAt(x, y);
    
    // detect zones
    var match = undefined;

    Object.keys(view.layout.zones).forEach(function(zonename) {
      var zone = view.layout.zones[zonename];
      if (x > zone.x && x < zone.x + zone.w &&
        y > zone.y && y < zone.y + zone.h) {
          match = zonename;
    }
    });
    
    if (game.rules.clickEvent != undefined) {
      game.rules.clickEvent(match, card);
    }
    
  };
  
})();
