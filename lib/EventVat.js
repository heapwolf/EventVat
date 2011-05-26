
;(function(exports) {

  var process = { EventEmitter: function() {} };
  // Begin wrap of nodejs implementation of EventEmitter

  var EventEmitter = exports.EventEmitter = process.EventEmitter;
  var isArray = Array.isArray;

  EventEmitter.prototype.emit = function(type) {

    var type = (~arguments[1].indexOf('/')) ? type + '/' + arguments[1] : type;

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events || !this._events.error ||
          (isArray(this._events.error) && !this._events.error.length))
      {
        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    if (!this._events) return false;
    var handler = this._events[type];
    if (!handler) return false;

    if (typeof handler == 'function') {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        // slower
        default:
          var args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
      return true;

    } else if (isArray(handler)) {
      var args = Array.prototype.slice.call(arguments, 1);

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
      return true;

    } else {
      return false;
    }
  };

  // EventEmitter is defined in src/node_events.cc
  // EventEmitter.prototype.emit() is also defined there.
  EventEmitter.prototype.addListener = function(type, key, listener) {
    
    if(typeof key === 'function') {
      listener = key, key = null;
    }

    if ('function' !== typeof listener) {
      throw new Error('addListener only takes instances of Function');
    }

    type = (key !== null) ? type + '/' + key : type;

    if (!this._events) this._events = {};

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    } else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);
    } else {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }

    return this;
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.once = function(type, key, listener) {
    
    type = (typeof key !== 'undefined') ? type + '/' + key : type;    
    
    var self = this;
    self.on(type, function g() {
      self.removeListener(type, g);
      listener.apply(this, arguments);
    });
  };

  EventEmitter.prototype.removeListener = function(type, key, listener) {
    if ('function' !== typeof listener) {
      throw new Error('removeListener only takes instances of Function');
    }

    type = (typeof key !== 'undefined') ? type + '/' + key : type;

    // does not use listeners(), so no side effect of creating _events[type]
    if (!this._events || !this._events[type]) return this;

    var list = this._events[type];

    if (isArray(list)) {
      var i = list.indexOf(listener);
      if (i < 0) return this;
      list.splice(i, 1);
      if (list.length == 0)
        delete this._events[type];
    } else if (this._events[type] === listener) {
      delete this._events[type];
    }

    return this;
  };

  EventEmitter.prototype.removeAllListeners = function(type, key) {
    
    type = (typeof key !== 'undefined') ? type + '/' + key : type;
    
    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events && this._events[type]) this._events[type] = null;
    return this;
  };

  EventEmitter.prototype.listeners = function(type, key) {
    
    type = (typeof key !== 'undefined') ? type + '/' + key : type;    
    
    if (!this._events) this._events = {};
    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };


}((typeof exports === 'undefined') ? window : exports));

var inherits = function(ctor, superCtor) {
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: { value: ctor, enumerable: false }
  });
};

;(function(exports) {

  exports.EventVat = function EventVat(data) {

    if (!(this instanceof EventVat)) {
      return new EventVat(data);
    }

    var self = this;

    this.store = data || {};

    this._deathRate = 10;
    this.keys = [];
    this.killer = setInterval(function() {

      var key = keys.shift();

      if(self.store[key].ttl < 0) {
        self.del(key);
      }
      else {
        (self.store[key].ttl--);
        keys.push(key);
      }

    }, this._deathRate);

    return this;

  };
  
  inherits(exports.EventVat, exports.EventEmitter);
  
  EventVat.prototype.get = function(key) {
    this.emit('get', key, this.store[key].value);
    return this.store[key].value;
  };

  EventVat.prototype.set = function(key, value, ttl) {
    var self = this;
    
    if(this.store[key]) {
      this.store[key].ttl = ttl;
    }
    else {
      this.store[key] = {
        value: value,
        ttl: ttl // time to live
      };
      
      this.keys.push(key);
      
    }
  
    this.emit('set', key, value);    
    return this.store[key].value;
  };
  
  EventVat.prototype.setnx = function(key, value) {
    if(!this.store[key]) {
      this.store[key] = value;
      this.emit('set', key, value);    
      return this.store[key].value;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.ren = function(oldKey, newKey) {
    if(this.store[oldKey]) {
      this.store[newKey] = this.store[oldKey];
      this.emit('ren', key, value);
      return this.store[key].value;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.decr = function(key) {
    if(this.store[key] && typeof this.store[key].value === 'number') {
      this.store[newKey].value--;
      this.emit('decr', key, value);
      return this.store[key].value;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.incr = function(key) {
    if(this.store[key] && typeof this.store[key].value === 'number') {
      this.store[newKey].value++;
      this.emit('incr', key, value);
      return this.store[key].value;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.swap = function(a, b, depth) {
    if(this.store[a] && this.store[b]) {
      
      a = this.store[a], b = this.store[b];
      
      if(depth) {
        a = [b, b = a][0];
      }
      else {
        a.value = [b.value, b.value = a.value][0];
      }

      this.emit('swap', a, b, depth);
      return depth ? [a, b] : [a.value, b.value];
    }
    else {
      return false;
    }

  };

  EventVat.prototype.findin = function(key, value) {
    if(this.store[key]) {
      var index = (~this.store[key].value.indexOf(value));
      this.emit('findin', key, value, index);
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.replace = function(key, oldValue, newValue) {
    
    // To-Do: this method could use a better implementation.
    
    if(this.store[key]) {
      this.store[key].value = this.store[key].value.replace(oldValue, newValue);
      this.emit('replace', key);
    }
    else {
      return false;
    }    
    
  };
  
  EventVat.prototype.del = function(key) {
    if(!this.store[key]) {
      this.emit('del', key);
      return delete this.store[key];      
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.created = function(key) {
    if(this.store[key]) {
      var datestamp = this.store[key].datestamp;
      this.emit('created', key, datestamp);
      return datestamp;
    }
    else {
      return false;
    }
  };

  EventVat.prototype.exists = function(key, duration, callback) {

    var self = this;

    if(!duration && this.store[key]) {
      return true;
    }
    else if(duration && callback) {
      setTimeout(function() {
        callback(key, !!(self.store[key]));
      }, duration);
    }
    else {
      return false;
    }

    this.emit('exists', key);
  };

  EventVat.prototype.ttl = function(key, ttl) {

    var self = this;

    if(ttl) {
      
      (ttl[0] === '+') ? ttl
      
      ttl = parseInt(ttl.slice(1), 10);
      
      this.store[key].postMortem = setTimeout(function() {
        self.del(key);
        self.emit('ttl', key);
      }, ttl);
    }
  };

  EventVat.prototype.dump = function(stringify) {
    var dump = stringify ? JSON.stringify(this.store) : this.store;
    this.emit('dump', null, dump);
    return dump;
  };

}((typeof exports === 'undefined') ? window : exports));

