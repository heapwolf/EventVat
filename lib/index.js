
;(function(exports, undefined) {

  var hash = (function(){

    var S = {};

    //
    // The highest integer value a number can go to without losing precision.
    //
    S.maxExactInt = Math.pow(2,53);

    //
    // Converts string from internal UTF-16 to UTF-8
    // and saves it using array of numbers (bytes), 0-255 per cell
    // @param {String} str
    // @return {Array}
    //
    S.toUtf8ByteArr = function(str){
      var arr = [], code;

      for (var i = 0; i < str.length; i++){
        code = str.charCodeAt(i);

        //
        // note that charCodeAt will always return a value that is less than 65,536.
        // This is because the higher code points are represented by a pair of (lower valued)
        // "surrogate" pseudo-characters which are used to comprise the real character.
        // Because of this, in order to examine or reproduce the full character for
        // individual characters of value 65,536 and above, for such characters,
        // it is necessary to retrieve not only charCodeAt(0), but also charCodeAt(1). 
        //
        if (0xD800 <= code && code <= 0xDBFF) {
          // UTF-16 high surrogate 
          var hi = code,
            low = str.charCodeAt(i + 1);

          code = ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;

          i++;
        }

        if (code <= 127){
          arr[arr.length] = code;
        } else if (code <= 2047){
          arr[arr.length] = (code >>> 6) + 0xC0;
          arr[arr.length] = code & 0x3F | 0x80;        
        } else if (code <= 65535){
          arr[arr.length] = (code >>> 12) + 0xE0;
          arr[arr.length] = (code >>> 6 & 0x3F) | 0x80;
          arr[arr.length] = (code & 0x3F) | 0x80;
        } else if (code <= 1114111){
          arr[arr.length] = (code >>> 18) + 0xF0;
          arr[arr.length] = (code >>> 12 & 0x3F) | 0x80;
          arr[arr.length] = (code >>> 6 & 0x3F) | 0x80;
          arr[arr.length] = (code & 0x3F) | 0x80;                
        } else {
          throw 'Unicode standart supports code points up-to U+10FFFF';
        }
      }    

      return arr;
    };

    //
    // Outputs 32 integer bits of a number in hex format.
    // Preserves leading zeros.
    // @param {Number} num
    //
    S.toHex32 = function(num){
      // if negative
      if (num & 0x80000000){
        // convert to positive number
        num = num & (~0x80000000);
        num += Math.pow(2,31);        
      }

      var str = num.toString(16);

      while (str.length < 8){
        str = '0' + str;
      }

      return str;    
    };

    //
    // Changes the order of 4 bytes in integer representation of number.
    // From 1234 to 4321. 
    // @param {Number} num Only 32 int bits are used.
    //
    S.reverseBytes = function(num){
      var res = 0;
      res += ((num >>> 24) & 0xff);
      res += ((num >>> 16) & 0xff) << 8;
      res += ((num >>> 8) & 0xff) << 16;
      res += (num & 0xff) << 24;
      return res;
    };

    S.leftRotate = function(x, c){
      return (x << c) | (x >>> (32-c));
    };    

    //
    // RSA Data Security, Inc. MD5 Message-Digest Algorithm
    // http://tools.ietf.org/html/rfc1321
    // http://en.wikipedia.org/wiki/MD5
    // @param {String} message
    // 
    S.md5 = function(message){
      // r specifies the per-round shift amounts
      var r = [7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22, 
           5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
           4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
           6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21];

      // Use binary integer part of the sines of integers (Radians) as constants:
      var k = [];
      for (var i = 0; i <= 63; i++){
        k[i] = (Math.abs(Math.sin(i + 1)) * Math.pow(2,32)) << 0;
      }

      var h0 = 0x67452301,
        h1 = 0xEFCDAB89,
        h2 = 0x98BADCFE,
        h3 = 0x10325476,
        bytes, unpadded;

      // Pre-processing:  
      bytes = S.toUtf8ByteArr(message);
      message = null;    
      unpadded = bytes.length;

      // append "1" bit to message
      // append "0" bits until message length in bits ≡ 448 (mod 512)  
      bytes.push(0x80);    
      var zeroBytes = Math.abs(448 - (bytes.length * 8) % 512) / 8;

      while (zeroBytes--){  
        bytes.push(0);
      }

      // append bit length of unpadded message as 64-bit little-endian integer to message    
      bytes.push( unpadded * 8 & 0xff,
            unpadded * 8 >> 8 & 0xff,
            unpadded * 8 >> 16 & 0xff,
            unpadded * 8 >> 24 & 0xff);

      var i = 4;
      while (i--){
        bytes.push(0);
      }      

      var leftRotate = S.leftRotate;

      // Process the message in successive 512-bit chunks:
      var i = 0, w = [];
      while ( i < bytes.length){

        // break chunk into sixteen 32-bit words w[i], 0 ≤ i ≤ 15
        for (var j = 0; j <= 15; j++){
          w[j] = (bytes[i + 4*j] << 0) +
              (bytes[i + 4*j + 1] << 8) +
              (bytes[i + 4*j + 2] << 16) +
              (bytes[i + 4*j + 3] << 24); 
        }          

        // Initialize hash value for this chunk:
        var a = h0,
          b = h1,
          c = h2,
          d = h3,
          f, g;      

        // Main loop:
        for (var j = 0; j <= 63; j++){

          if (j <= 15){
            f = (b & c) | ((~b) & d);
            g = j;  
          } else if (j <= 31){
            f = (d & b) | ((~d) & c);
            g = (5 * j + 1) % 16; 
          } else if (j <= 47){
            f = b ^ c ^ d;
            g = (3 * j + 5) % 16;
          } else {
            f = c ^ (b | (~d));
            g = (7 * j) % 16;
          }

          var temp = d;

          d = c;
          c = b;
          b = b + leftRotate((a + f + k[j] + w[g]), r[j]);
          a = temp;    
        }      

        // Add this chunk's hash to result so far:
        h0 = (h0 + a) << 0;
        h1 = (h1 + b) << 0; 
        h2 = (h2 + c) << 0;
        h3 = (h3 + d) << 0;

        i += 512 / 8;
      }

      // fix when starting with 0      
      var res = out(h0) + out(h1) + out(h2) + out(h3);

      function out(h){
        return S.toHex32(S.reverseBytes(h));
      }

      return res;    
    };  

    return S;

  })();

  var nextRev = function() {
    self.rev = hash.md5(String(new Date()));
    return self.revs[self.rev];
  }

  var EventEmitter2, EventVat;

  if(!EventEmitter2 && require) {
    EventEmitter2 = require('./node_modules/EventEmitter2').EventEmitter2;
    if(!EventEmitter2) {
      throw new Error('`EventEmitter2` is not defined.');
    }
  }

  function init() {
    this._events = new Object;
  }

  this.wildcard = ' ';
  this.listenerTree = new Object;

  EventVat = exports.EventVat = function EventVat(conf) {

    if (!(this instanceof EventVat)) {
      return new EventVat(conf);
    }

    var self = this;

    self.rev = conf && conf.revision || nextRev();

    self.revs = {};
    self.revs[self.rev] = conf && conf.data || {};

    self.keys = [];

    self.killRate = 10;
    self.killer = setInterval(function() {

      var key = self.keys.shift();
      var keyExists = !!self.revs[self.rev][key];

      if(keyExists && self.revs[self.rev][key].dueDate === Date.now()) {
        self.del(key);
        return true;
      }

      if(keyExists && self.revs[self.rev][key].ttl && self.revs[self.rev][key].ttl < 0) {
        self.del(key);
      }
      else if(keyExists && self.revs[self.rev][key].ttl) {
        (self.revs[self.rev][key].ttl--);
        keys.push(key);
      }

      return true;
      
    }, self.killRate);

    return this;
  };

  for (var member in EventEmitter2.prototype) {
    EventVat.prototype[member] = EventEmitter2.prototype[member];
  }

  EventEmitter2.prototype.publish = EventEmitter2.prototype.emit;
  EventEmitter2.prototype.subscribe = EventEmitter2.prototype.on;

  // KEYS
  // ----

  //
  // Delete a key
  //
  EventVat.prototype.del = function(key) {
    if(!this.revs[this.rev][key]) {
      this.emit('del ' + key);
      this.emit('del');
      return delete this.revs[this.rev][key];
    }
    else {
      return false;
    }
  };

  //
  // Determine if a key exists
  //
  EventVat.prototype.exists = function(key) {
    if(this.revs[this.rev][key]) {
      this.emit('exists ' + key);
      this.emit('exists');
      return true;
    }
    else {
      return false;
    }
  };

  //
  // Set a key's time to live in seconds
  //
  EventVat.prototype.expires = function(key, ttl) {

    var self = this, newVal;
    var op = ttl[0];

    ttl = +ttl.slice(1);

    if(op === '+') { 
      newVal = this.revs[this.rev][key].ttl += ttl;
    }
    else {
      newVal = this.revs[this.rev][key].ttl -= ttl;
    }
    
    this.keys.push(key);

    return newVal;
  };

  //
  // Set the expiration for a key as a UNIX timestamp
  //
  EventVat.prototype.expireat = function(key, dueDate) {
    if(this.revs[this.rev][key]) {
      this.keys.push(key);
      return this.revs[this.rev][key].dueDate = dueDate;
    }
    else {
      return false;
    }
  };

  //
  // Find all keys matching the given pattern
  //
  EventVat.prototype.keys = function(key) {

    if(this.revs[this.rev][key]) {
      var keys = [];

      for(var k in this.revs[this.rev]) {
        if(regex.test(key)) {
          keys.push(k);
        }
      }

      return keys;
    }
    else {
      return false;
    }
  };

  //
  // Move a key to another database
  //
  EventVat.prototype.move = function(key, db) {
    if(db && db.revs) {
      db.revs[db.rev][key] = this.revs[db.rev][key];
      delete this.revs[db.rev][key];
      return true;
    }
    return false;
  }

  //
  // Inspect the internals of EventVat objects
  //
  EventVat.prototype.object = function(subcommend /* ... */) {
    throw new Error('Not implemented.');
  };

  //
  // Remove the expiration from a key
  //
  EventVat.prototype.persist = function(key) {
    if(this.revs[this.rev][key] && self.revs[self.rev][key].ttl) {
      this.emit('persist ' + key);
      this.emit('persist');
      return delete this.revs[this.rev][key].ttl;
    }
    else {
      return false;
    }
  };

  //
  // Return a random key from the keyspace
  //
  EventVat.prototype.randomkey = function() {
    var keys = Object.keys(this.revs[this.rev]);
    var index = Math.floor(Math.random()*keys.length);
    return keys[index];
  };

  //
  // Rename a key
  //
  EventVat.prototype.rename = function(oldKey, newKey) {
    if(this.revs[this.rev][oldKey]) {
      this.revs[this.rev][newKey] = this.revs[this.rev][oldKey];
      this.emit('rename ' + oldKey, newKey);
      this.emit('rename', oldKey, newKey);
      return this.revs[this.rev][key].value;
    }
    else {
      return false;
    }
  };

  //
  // Rename a key, only if the new key does not exist
  //
  EventVat.prototype.renamenx = function(oldKey, newKey) {
    if(this.revs[this.rev][oldKey] && typeof this.revs[this.rev][newKey] === 'undefined') {
      this.revs[this.rev][newKey] = this.revs[this.rev][oldKey];
      this.emit('renamenx ' + oldKey, newKey);
      this.emit('renamenx', oldKey, newKey);
      return this.revs[this.rev][key].value;
    }
    else {
      return false;
    }
  };  

  //
  // Sort key by pattern
  //
  EventVat.prototype.sort = function() {
    throw new Error('Not implemented.');

    // fast javascript sort...
    
    //
    //SORT key [BY pattern] [LIMIT offset count] [GET pattern [GET pattern ...]] [ASC|DESC] [ALPHA] [STORE destination]
    //

  };

  //
  // Determine the type stored at key
  //
  EventVat.prototype.type = function(key) {
    return ({}).toString.call(this.revs[this.rev][key]);
  };

  //
  // Get the time to live for a key
  //
  EventVat.prototype.ttl = function(key, ttl) {
    return this.revs[this.rev][key].ttl;
  };

  // STRINGS
  // -------

  //
  // Append a value to a key
  //
  EventVat.prototype.append = function(key, value) {
    if(this.revs[this.rev][key] && typeof this.revs[this.rev][key] === 'string') {
      var newValue = this.revs[this.rev][key].value + value;
      this.emit('append ' + key, value, newValue);
      this.emit('append', value, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // Decrement the integer value of a key by one
  //
  EventVat.prototype.decr = function(key) {
    this.decrby(key, 1);
  };

  //
  // Decrement the integer value of a key by N
  //
  EventVat.prototype.decrby = function(key, value) {
    if(this.revs[this.rev][key] && typeof this.revs[this.rev][key].value === 'number') {
      var newValue = value ? this.revs[this.rev][newKey].value -= value : this.revs[this.rev][newKey].value--;
      this.emit('decr ' + key, value, newValue);
      this.emit('decr', value, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // Get the value of a key
  //
  EventVat.prototype.get = function(key) {

    var newValue;

    if(this.revs[this.rev][key]) {
      var newValue = this.revs[this.rev][key].value;
      this.emit('get ' + key, newValue);
      this.emit('get', newValue);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // Returns the bit value at offset in the string value stored at key
  //
  EventVat.prototype.getbit = function(key) {
    throw new Error('Not implemented.');
  };

  //
  // Get a substring of the string stored at a key
  //
  EventVat.prototype.getrange = function(key, start, end) {
    throw new Error('Not implemented.');
  };

  //
  // Set the string value of a key and return its old value
  //
  EventVat.prototype.getset = function(key, value) {
    var old = this.get(key);
    this.set(key, value);
    return old;
  };

  //
  // Increment the integer value of a key by one
  //
  EventVat.prototype.incr = function(key, value) {
    value = +value;
    if(this.revs[this.rev][key] && typeof this.revs[this.rev][key].value === 'number') {
      this.revs[this.rev][newKey].value++;
      this.emit('incrby ' + key, value);
      this.emit('incrby', value);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // Increment the integer value of a key by the given number
  //
  EventVat.prototype.incrby = function(key, value) {
    value = +value;
    if(this.revs[this.rev][key] && typeof this.revs[this.rev][key].value === 'number') {
      this.revs[this.rev][newKey].value++;
      this.emit('incrby ' + key, value);
      this.emit('incrby', value);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // Get the values of all the given keys
  //
  EventVat.prototype.mget = function(key /* ... */) {
    var values = [];
    for(var i=0, l=arguments.length; i < l; i++) {
      values.push(this.get(arguments[i]));
    }
    return values;
  };

  //
  // Set multiple keys to multiple values
  //
  EventVat.prototype.mset = function(key /* ... */) {
    var values = [];
    for(var i=0, l=arguments.length; i < l; i++) {
      values.push(this.set(arguments[i]));
    }
    return values;
  };

  //
  // Set multiple keys to multiple values, only if none of the keys exist
  //
  EventVat.prototype.msetnx = function(key, value /* ... */) {
    var values = [];
    for(var i=0, l=arguments.length; i < l; i++) {
      values.push(this.setnx(arguments[i]));
    }
    return values;
  };

  //
  // Set the string value of a key
  //
  EventVat.prototype.set = function(key, value, ttl) {
    var self = this;
    
    if(this.revs[this.rev][key]) {
      this.revs[this.rev][key].ttl = ttl;
      this.revs[this.rev][key].value = value;
    }
    else {
      this.revs[this.rev][key] = {
        value: value,
        ttl: ttl // time to live
      };

      this.keys.push(key);
    }

    this.emit('set ' + key, value);
    this.emit('set', key, value);
    return value;
  };

  //
  // Sets or clears the bit at offset in the string value stored at key
  //
  EventVat.prototype.setbit = function(key, offset, value) {
    throw new Error('Not implemented.');
  };

  //
  // Set the value and expiration of a key
  //
  EventVat.prototype.setex = function(key, seconds, value) {
    throw new Error('Not implemented.');
  };

  //
  // Set the value and expiration of a key
  //
  EventVat.prototype.setnx = function(key, value) {
    if(!this.revs[this.rev][key]) {
      this.revs[this.rev][key] = value;
      this.emit('setnx ' + key, value);
      this.emit('setnx');
      return this.revs[this.rev][key].value;
    }
    else {
      return false;
    }
  };

  //
  // Get the length of the value stored in a key
  //
  EventVat.prototype.strlen = function(key) {
    if(this.revs[this.rev][key]) {
      this.revs[this.rev][key].length;
    }
    return false;
  };

  //
  // HASHES
  // ------
  //

  //
  // delete one or more hash fields
  //
  EventVat.prototype.hdel = function(key, field /* ... */) {
    if (!this.revs[this.rev][key]) {
      if (arguments.length > 1) {
        for (var i=1, l = arguments.length; i < l; i++) {
          if(this.revs[this.rev][key][arguments[i]]) {
            delete this.revs[this.rev][key][arguments[i]];
          }
        }
        this.emit('hdel ' + key);
        this.emit('hdel');
        return true;
      }
    }
    else {
      return false;
    }
  };

  //
  // determine if a hash field exists
  //
  EventVat.prototype.hexists = function(key, field) {
    if(this.revs[this.rev][key] && this.revs[this.rev][key][field]) {
      return true;
    }
    else {
      return false;
    }
  };

  //
  // get the value of a hash field.
  //
  EventVat.prototype.hget = function(key, field) {
    if(this.revs[this.rev][key] && this.revs[this.rev][key][field]) {
      return this.revs[this.rev][key][field];
    }
    else {
      return false;
    }
  };

  //
  // get all the fields and values in a hash
  //
  EventVat.prototype.hgetall = function(key) {
    if(this.revs[this.rev][key] && this.revs[this.rev][key][field]) {
      return this.revs[this.rev][key];
    }
    else {
      return false;
    }
  };

  //
  // increment the integer value of a hash field by the given number
  //
  EventVat.prototype.hincrby = function(key, field, value) {
    value = +value;
    if(this.revs[this.rev][key][field] && typeof this.revs[this.rev][key][field].value === 'number') {
      this.revs[this.rev][newKey][field].value++;
      this.emit('hincrby ' + key, value);
      this.emit('hincrby', value);
      return newValue;
    }
    else {
      return false;
    }
  };

  //
  // get all the fields in a hash
  //
  EventVat.prototype.hkeys = function(key) {
    throw new Error('Not implemented.');
  };

  //
  // get the number of fields in a hash
  //
  EventVat.prototype.hlen = function(key) {
    throw new Error('Not implemented.');
  };

  //
  // get the values of all the given hash fields
  //
  EventVat.prototype.hmget = function(key, field /* ... */) {
    throw new Error('Not implemented.');
  };

  //
  // set multiple hash fields to multiple values
  //
  EventVat.prototype.hmset = function(key, field, value /* ... */) {
    throw new Error('Not implemented.');
  };

  //
  // set the string value of a hash field
  //
  EventVat.prototype.hset = function(key, field, value) {
    throw new Error('Not implemented.');
  };

  //
  // Set the value of a hash field, only if the field does not exist
  //
  EventVat.prototype.hsetnx = function(key, field, value /* ... */) {
    throw new Error('Not implemented.');
  };

  //
  // get all the values in a hash
  //
  EventVat.prototype.hvals = function(key) {
    throw new Error('Not implemented.');
  };

  //
  //
  // Non stsandard methods.
  //
  //
  EventVat.prototype.dump = function(stringify) {
    
    var dump = {};
    
    for(var key in this.revs[this.rev]) {
      if(this.revs[this.rev].hasOwnProperty(key)) {
        dump[key] = this.revs[this.rev][key].value;
      }
    }
    
    dump = stringify ? JSON.stringify(dump) : dump;
    
    this.emit('dump', null, dump);
    return dump;
  };

  //
  // swap the values of two keys
  //
  EventVat.prototype.swap = function(a, b, depth) {
    if(this.revs[this.rev][a] && this.revs[this.rev][b]) {
      
      a = this.revs[this.rev][a]; 
      b = this.revs[this.rev][b];
      
      if(depth) {
        a = [b, b = a][0];
      }
      else {
        a.value = [b.value, b.value = a.value][0];
      }

      this.emit('swap ' + a, b, depth);
      this.emit('swap', a, b, depth);
      return depth ? [a, b] : [a.value, b.value];
    }
    else {
      return false;
    }

  };

  //
  // check if a value is in a key
  //
  EventVat.prototype.findin = function(key, value) {
    if(this.revs[this.rev][key]) {
      var index = (~this.revs[this.rev][key].value.indexOf(value));
      this.emit('findin ' + key, value, index);
      this.emit('findin', value, index);
      return index;
    }
    else {
      return false;
    }
  };

  //
  // set the current revision
  //

}((typeof exports === 'undefined') ? window : exports));

