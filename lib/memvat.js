
;(function(exports) {

  var process = { EventEmitter: function() {} };
  // Begin wrap of nodejs implementation of EventEmitter

  var EventEmitter = exports.EventEmitter = process.EventEmitter;
  var isArray = Array.isArray;

  EventEmitter.prototype.emit = function(type, key) {
    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events || !this._events.error ||
          (isArray(this._events.error) && !this._events.error.length))
      {
        if (arguments[2] instanceof Error) {
          throw arguments[2]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    if (!this._events) return false;
    
    type = typeof key !== 'undefined' ? (type + '/' + key) : type;
    
    var handler = this._events[type];
    if (!handler) return false;

    if (typeof handler == 'function') {
      switch (arguments.length) {
        // fast cases
        case 1:
          handler.call(this, key);
          break;
        case 2:
          handler.call(this, key, arguments[2]);
          break;
        case 3:
          handler.call(this, key, arguments[2], arguments[3]);
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
    if ('function' !== typeof listener) {
      throw new Error('addListener only takes instances of Function');
    }

    if (!this._events) this._events = {};

    type = typeof key !== 'undefined' ? (type + '/' + key) : type;

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, key, listener);

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

  EventEmitter.prototype.once = function(type, listener) {
    var self = this;
    self.on(type, function g() {
      self.removeListener(type, g);
      listener.apply(this, arguments);
    });
  };

  EventEmitter.prototype.removeListener = function(type, listener) {
    if ('function' !== typeof listener) {
      throw new Error('removeListener only takes instances of Function');
    }

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

  EventEmitter.prototype.removeAllListeners = function(type) {
    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events && this._events[type]) this._events[type] = null;
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
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

  exports.Memvat = function Memvat(data) {
    
    if (!(this instanceof Memvat)) {
      return new Memvat(data);
    }
    
    this.store = {};
    
    return this;
    
  };
  
  inherits(exports.Memvat, exports.EventEmitter);  
  
  Memvat.prototype.get = function(key) {
    this.emit('get', key, this.store[key]);
    return this.store[key];
  };

  Memvat.prototype.set = function(key, value) {
    this.store[key] = value;
    this.emit('set', key, value);    
    return this.store[key];
  };
  
  Memvat.prototype.setnx = function(key, value) {
    this.emit('setnx', key);
  };
  
  Memvat.prototype.ren = function(key, key) {
    this.emit('ren', key);
  };
  
  Memvat.prototype.decr = function(key) {
    this.emit('decr', key);
  };
  
  Memvat.prototype.incr = function(key) {
    this.emit('incr', key);
  };
  
  Memvat.prototype.swap = function(key, key) {
    this.emit('swap', key);
  };
  
  Memvat.prototype.findin = function(key, value) {
    this.emit('findin', key);
  };
  
  Memvat.prototype.replace = function(key, value) {
    this.emit('replace', key);
  };
  
  Memvat.prototype.del = function(key) {
    this.emit('del', key);
  };
  
  Memvat.prototype.created = function(key) {
    this.emit('created', key);
  };

  Memvat.prototype.exists = function(key, duration, callback) {
    this.emit('exists', key);    
  };

  Memvat.prototype.expires = function(key, duraction) {
    this.emit('expires', key);
  };

  Memvat.prototype.ttl = function(key, duration) {
    this.emit('ttl', key);
  };
  
  Memvat.prototype.dump = function(stringify) {
    var dump = stringify ? JSON.stringify(this.store) : this.store;
    this.emit('dump', null, dump);
    return dump;
  };

}((typeof exports === 'undefined') ? window : exports));

