/**
 * Provides methods to update UI elements on the page.
 *
 */

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var ui = g.ui = { }

  document.addEventListener("DOMContentLoaded", function(event) { 
    ui.actionEl = document.getElementById('game-actions');
    ui.infoEl = document.getElementById('game-info');
    ui.reset();
  });
  
  /**
   * Reset elements.
   */
  ui.reset = function() {
    if (ui.actionEl) {
      ui.actionEl.innerHTML = '';
      
      // create button group
      var div = document.createElement('div');
      div.classList.add('btn-group');
      div.setAttribute('data-toggle', 'buttons');
      ui.actionEl.appendChild(div);
      ui.actionRadioEl = div;
      
    };
  };
  
  /**
   * Adds an action button.
   */
  ui.button = function(title, onclick) {
    
    if (ui.actionEl) {
      var btn = document.createElement('button');
      btn.innerHTML = title;
      btn.classList.add('btn');
      btn.classList.add('btn-default');
      btn.onclick = onclick;
      ui.actionEl.appendChild(btn);
    }

  };
  
  /**
   * Adds a group of radio buttons.
   */
  ui.radioButtons = function(buttonArray) {
    if (!ui.actionRadioEl) return;
    buttonArray.forEach(function(button, index){
      var label = document.createElement('label');
      label.classList.add('btn');
      label.classList.add('btn-primary');
      if (index == 0) label.classList.add('active');  // first item active
      
      var input = document.createElement('input');
      input.setAttribute('type', 'radio');
      input.setAttribute('name', 'options');
      input.setAttribute('autocomplete', 'off');
      input.onclick = button.onclick;
      
      label.innerHTML = button.title;
      label.appendChild(input);
      
      ui.actionRadioEl.appendChild(label);
    });
  };
  
  /**
   * Display info text.
   */
  ui.info = function(text) {
    if (ui.infoEl) {
      ui.infoEl.innerHTML = text;
    };
  };
  
})();
