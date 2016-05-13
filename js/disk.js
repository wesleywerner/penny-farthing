;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;
  var disk = g.disk = { };
  
  disk.saves = { };

  disk.save = function(key, value) {
    if (disk.allow) {
      window.localStorage.setItem(key, JSON.stringify(value));
    };
  };
  
  disk.load = function(key) {
    if (disk.allow) {
      var data = window.localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    };
  }

  disk.init = function() {
    try {
      var storage = window.localStorage,
        x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      disk.allow = true;
    }
    catch(e) {
      return false;
    }
  };
  
  disk.init();

})();

