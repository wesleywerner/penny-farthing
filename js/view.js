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
    piletop: 0.02,
    pileside: 0.02,
    stack: 0.005,       // x-offset of stacked cards
    };
    
  /**
   * Define sizes.
   */
  v.size = { };
  v.size.ratios = {
    font: 0.03,
  }
  
  /**
   * Stores the grid positions for card columns and rows.
   * Calculated on resize.
   */
  v.grid = null;
  
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
    
    // Request the rules layout
    v.layout = game.rules.requestLayout();
    
    var w = v.element.clientWidth;
    var h = v.element.clientHeight;
    
    // The height is neglible at this point.
    // We calculate the card width first based on how many piles
    // the rules request. Then we work out the height of a card
    // and only then do we calculate the height of the canvas.
    
    // resize the canvas area to match the client area
    v.ctx.canvas.width = v.width = w;
    
    // scale font
    v.size.font = Math.floor( v.size.ratios.font * w );
    
    // padding via preset ratios
    v.pad.side = Math.floor(v.pad.ratios.side * w);
    v.pad.pileside = Math.floor(v.pad.ratios.pileside * w);

    // To calculate the card size, we look at the canvas size
    // and how many columns the rules request.
    // We account for padding between the piles.
    var stackRows = v.layout.columnsRequested;
    var widthMinusPad = w - v.pad.side * 2 - v.pad.pileside * stackRows;
    v.cardWidth = Math.floor( widthMinusPad / stackRows );
    v.cardHeight = Math.floor(v.cardWidth * 1.4);  // 1.4 is the height ratio of our card images

    // resize the canvas height to n cards
    var stackRows = v.layout.rowsRequested;
    stackRows = stackRows == undefined ? 3 : stackRows;
    var stackHeight = stackRows * v.cardHeight;
    
    // vertical padding now that we have our height
    v.pad.top = Math.floor(v.pad.ratios.top * h);
    v.pad.piletop = Math.floor(v.pad.ratios.piletop * h);
    v.pad.stack = Math.floor(v.pad.ratios.stack * h);

    // Resize the canvas height
    // Include the top padding and padding between rows of cards
    var stackPadding = (v.pad.top * 2) + (v.pad.piletop * stackRows);
    v.ctx.canvas.height = h = v.height = Math.floor(stackHeight + stackPadding);

    // The grid positions
    v.grid = { };
    v.grid.cells = [ ];
    v.grid.cols = v.layout.columnsRequested;
    v.grid.rows = v.layout.rowsRequested;
    
    for (col=0; col < v.grid.cols; col++) {
      for (row=0; row < v.grid.rows; row++) {

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
        // add the card size (multiplied per row)
        y += row * v.cardHeight;
        // add the edge padding
        y += v.pad.top;
      
        // initialise array
        v.grid.cells[col] = v.grid.cells[col] == undefined ? [] : v.grid.cells[col];
        v.grid.cells[col][row] = {x:x, y:y};
      }
    }
    
    // Calculate zone positions from grid positions
    Object.keys(v.layout.zones).forEach(function(zonename) {
      var zone = v.layout.zones[zonename];
      var grid = v.grid.cells[zone.col-1][zone.row-1];
      zone.x = grid.x;
      zone.y = grid.y;
      zone.w = Math.floor(zone.width*v.cardWidth + (zone.width-1)*v.pad.pileside);
      zone.h = Math.floor(zone.height*v.cardHeight + (zone.height-1)*v.pad.piletop);
      // find the center of each zone
      zone.cenx = zone.x + zone.w/2;
      zone.ceny = zone.y + zone.h/2;
    });
    
    // Request to redraw
    requestAnimationFrame(v.draw);
  };
  
  /**
   * Adds a zone by grid column and row.
   */
  v.addZoneFunc = function(name, col, row, width, height) {
    var grid = v.grid.cells[col-1][row-1];
    if (grid == undefined) return;
    zone = {
      name:name,
      x:grid.x,
      y:grid.y,
      w:Math.floor(width*v.cardWidth),
      h:Math.floor(height*v.cardHeight)
    };
    v.zones.push(zone);
  };
  
  /**
   * Draw a card back
   */
  v.drawCardBack = function(x, y) {
    v.ctx.drawImage(document.images[0], x, y, v.cardWidth, v.cardHeight);
  };
  
  /**
   * Draw a card.
   */
  v.drawCard = function(card, x, y) {
    
    if (card == undefined) return;
    
    // draw card shape
    if (card.up) {
      var map = v.facelookup[card.name];
      if (map == undefined) {
        v.ctx.fillStyle = "white";
        v.ctx.fillRect(x, y, v.cardWidth, v.cardHeight);
        v.ctx.font = "12px serif";
        v.ctx.fillStyle = "red";
        v.ctx.fillText('card face image not found', x, y+14);
      }
      else {
        v.ctx.drawImage(document.images[1],
          map.x, map.y, v.facelookup.gridsize.w, v.facelookup.gridsize.h,
          x, y, v.cardWidth, v.cardHeight);
      }
    }
    else {
      v.drawCardBack(x, y);
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
    v.ctx.fillRect(0, 0, v.width, v.height);

    // draw zones
    // TODO predraw this loop to an off screen images for blitting here
    Object.keys(v.layout.zones).forEach(function(zonename) {
      
      var zone = v.layout.zones[zonename];
      
      // outline
      v.ctx.fillStyle = 'darkgreen';
      v.ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      
      // title
      v.ctx.fillStyle = 'green';
      v.ctx.textAlign = 'center';
      v.ctx.font = v.size.font.toString() + 'px serif';
      v.ctx.fillText(zonename, zone.cenx, zone.ceny);
      
    });
    
    // Cards
    Object.keys(v.layout.zones).forEach(function(zonename) {
      
      var zone = v.layout.zones[zonename];
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
          var x = zone.x-index*v.pad.stack;
          var y = zone.y;
          // store the card position
          card.pos = {x:x, y:y};
          v.drawCard(card, x, y);
        });
      }

      if (ismanypiles) {
        // this is an array of piles
        zonepiles.forEach(function(pile, col){
          pile.cards.forEach(function(card, row){
            // position for each column.
            var x = zone.x + (col*v.pad.pileside) + (col*v.cardWidth);
            // offset y for a stack like effect
            var y = zone.y + (row * v.pad.piletop);
            // store the card position
            card.pos = {x:x, y:y};
            v.drawCard(card, x, y);
          });
        });
      }

    });
    
    // Grid
    v.ctx.strokeStyle = 'blue';
    for (col=0; col < v.grid.cols; col++) {
      for (row=0; row < v.grid.rows; row++) {
        v.ctx.strokeRect(
          v.grid.cells[col][row].x,
          v.grid.cells[col][row].y,
          v.cardWidth,
          v.cardHeight
          );
      }
    }

  };
  
  /**
   * Gets the card at position x,y
   */
  v.cardAt = function(x, y) {
    
    // store the card matched under x,y
    var match = undefined;
    
    // scan each zone
    Object.keys(v.layout.zones).forEach(function(zonename) {
      
      var zone = v.layout.zones[zonename];
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
          if (x > card.pos.x && x < card.pos.x + v.cardWidth &&
              y > card.pos.y && y < card.pos.y + v.cardHeight) {
            match = card;
          }
        });
      }

      if (ismanypiles) {
        // this is an array of piles
        zonepiles.forEach(function(pile, col){
          pile.cards.forEach(function(card, index){
            if (x > card.pos.x && x < card.pos.x + v.cardWidth &&
                y > card.pos.y && y < card.pos.y + v.cardHeight) {
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
  v.click = function(x, y) {
    
    // get the card at this position
    var card = v.cardAt(x, y);
    
    // detect zones
    var match = undefined;

    Object.keys(v.layout.zones).forEach(function(zonename) {
      var zone = v.layout.zones[zonename];
      if (x > zone.x && x < zone.x + zone.w &&
        y > zone.y && y < zone.y + zone.h) {
          match = zonename;
    }
    });
    
    v.clickedEvent(match, card);
    
  };
  
  
  
  /**
   * Define callbacks that can be overwritten by the rules file.
   */
   
  /**
   * Called after the view.click method is called with the hit results.
   */
  v.clickedEvent = function(zone, card) {
    var name = card == undefined ? '' : card.name;
    if (zone != undefined) {
      console.log('click hit in zone ' + zone + ' - ' + name);
    }
    if (zone == 'reserve') {
      // example rule. this would never happen in the view.
      // discard old
      if (game.model.cards.hand.cards.length == 1) {
        game.model.cards.waste.add(game.model.cards.hand.take());
      }
      var n = game.model.cards.reserve.take();
      if (n.cards.length == 1) {
        var m = n.cards[0];
        m.up = true;
        game.model.cards.hand.add(m);
        requestAnimationFrame(v.draw);
      }
    }
  };
  
})();
