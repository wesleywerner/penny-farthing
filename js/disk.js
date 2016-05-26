/**
    This file is part of Penny Farthing.

    Penny Farthing is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Penny Farthing is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Penny Farthing.  If not, see <http://www.gnu.org/licenses/>.
  */
  
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

