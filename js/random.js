

;(function(){
  var g = window.game = window.game == undefined ? { } : window.game;

  // Linear Congruential Generator
  // Variant of a Lehman Generator 
  g.lcg = (function() {
    // Set to values from http://en.wikipedia.org/wiki/Numerical_Recipes
        // m is basically chosen to be large (as it is the max period)
        // and for its relationships to a and c
    var m = 4294967296,
        // a - 1 should be divisible by m's prime factors
        a = 1664525,
        // c and m should be co-prime
        c = 1013904223,
        seed, z;
    return {
      setSeed : function(val) {
        z = seed = val || Math.round(Math.random() * m);
      },
      getSeed : function() {
        return seed;
      },
      rand : function() {
        // define the recurrence relationship
        z = (a * z + c) % m;
        // return a float in [0, 1) 
        // if z = m then z / m = 0 therefore (z % m) / m < 1 always
        return z / m;
      }
    };

}());


})();
