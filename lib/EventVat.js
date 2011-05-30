
/*
 * EventVat.js
 * docs: http://www.github.com/hij1nx/EventVat
*/


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

      var key = self.keys.shift();
      var keyExists = !!self.store[key];

      if(keyExists && self.store[key].dueDate === Date.now()) {
        self.del(key);
        return true;
      }

      if(keyExists && self.store[key].ttl && self.store[key].ttl < 0) {
        self.del(key);
      }
      else if(keyExists && self.store[key].ttl) {
        (self.store[key].ttl--);
        keys.push(key);
      }
      
      return true;
      
    }, this._deathRate);

    return this;
  };

  EventVat.prototype.emit = function(type) {

    var args;
    var key = arguments[1] !== undefined && arguments[1] !== null;

    type = (key ? type + '/' + arguments[1] : type);

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      if (!this._events || !this._events.error ||
          (({}).toString.call(this._events.error) && !this._events.error.length))
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
    if (!handler) { return false; }

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
          args = Array.prototype.slice.call(arguments, 1);
          handler.apply(this, args);
      }
      return true;

    } else if (({}).toString.call(handler)) {
      args = Array.prototype.slice.call(arguments, 1);

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
      return true;

    } else {
      return false;
    }
  };

  // EventVat is defined in src/node_events.cc
  // EventVat.prototype.emit() is also defined there.
  EventVat.prototype.addListener = function(type, key, listener) {
    
    if(typeof key === 'function') {
      listener = key; 
      key = null;
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
    } else if (({}).toString.call(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);
    } else {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }

    return this;
  };

  EventVat.prototype.on = EventVat.prototype.addListener;

  EventVat.prototype.once = function(type, key, listener) {
    
    type = (typeof key !== 'undefined') ? type + '/' + key : type;    
    
    var self = this;
    self.on(type, function g() {
      self.removeListener(type, g);
      listener.apply(this, arguments);
    });
  };

  EventVat.prototype.removeListener = function(type, key, listener) {
    if ('function' !== typeof listener) {
      throw new Error('removeListener only takes instances of Function');
    }

    type = (typeof key !== 'undefined') ? type + '/' + key : type;

    // does not use listeners(), so no side effect of creating _events[type]
    if (!this._events || !this._events[type]) return this;

    var list = this._events[type];

    if (({}).toString.call(list)) {
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

  EventVat.prototype.removeAllListeners = function(type, key) {
    
    type = (typeof key !== 'undefined') ? type + '/' + key : type;
    
    // does not use listeners(), so no side effect of creating _events[type]
    if (type && this._events && this._events[type]) this._events[type] = null;
    return this;
  };

  EventVat.prototype.listeners = function(type, key) {
    
    type = (typeof key !== 'undefined') ? type + '/' + key : type;    
    
    if (!this._events) this._events = {};
    if (!this._events[type]) this._events[type] = [];
    if (!({}).toString.call(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };
  
  EventVat.prototype.get = function(key) {

    var newValue;

    if(this.store[key]) {
      var newValue = this.store[key].value;
      this.emit('get', key, newValue);
      this.emit('get', null, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };

  EventVat.prototype.set = function(key, value, ttl) {
    var self = this;
    
    if(this.store[key]) {
      this.store[key].ttl = ttl;
      this.store[key].value = value;
    }
    else {
      this.store[key] = {
        value: value,
        ttl: ttl // time to live
      };

      this.keys.push(key);
    }

    this.emit('set', key, value);
    this.emit('set', null, key, value);
    return value;
  };
  
  EventVat.prototype.setnx = function(key, value) {
    if(!this.store[key]) {
      this.store[key] = value;
      this.emit('set', key, value);
      this.emit('set');
      return this.store[key].value;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.rename = function(oldKey, newKey) {
    if(this.store[oldKey]) {
      this.store[newKey] = this.store[oldKey];
      this.emit('rename', oldKey, newKey);
      this.emit('rename', null, oldKey, newKey);
      return this.store[key].value;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.renamenx = function(oldKey, newKey) {
    if(this.store[oldKey] && typeof this.store[newKey] === 'undefined') {
      this.store[newKey] = this.store[oldKey];
      this.emit('renamenx', oldKey, newKey);
      this.emit('renamenx', null, oldKey, newKey);
      return this.store[key].value;
    }
    else {
      return false;
    }
  };  
  
  EventVat.prototype.decr = function(key, value) {
    if(this.store[key] && typeof this.store[key].value === 'number') {
      var newValue = value ? this.store[newKey].value -= value : this.store[newKey].value--;
      this.emit('decr', key, value, newValue);
      this.emit('decr', null, value, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.incr = function(key, value) {
    if(this.store[key] && typeof this.store[key].value === 'number') {
      value ? this.store[newKey].value += value : this.store[newKey].value++;
      this.emit('incr', key, value);
      this.emit('incr', null, value);
      return newValue;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.swap = function(a, b, depth) {
    if(this.store[a] && this.store[b]) {
      
      a = this.store[a]; 
      b = this.store[b];
      
      if(depth) {
        a = [b, b = a][0];
      }
      else {
        a.value = [b.value, b.value = a.value][0];
      }

      this.emit('swap', null, a, b, depth);
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
      this.emit('findin', null, value, index);
      return index;
    }
    else {
      return false;
    }
  };

  EventVat.prototype.del = function(key) {
    if(!this.store[key]) {
      this.emit('del', key);
      this.emit('del', null);
      return delete this.store[key];
    }
    else {
      return false;
    }
  };

  EventVat.prototype.exists = function(key) {
    if(this.store[key]) {
      this.emit('exists', key);
      this.emit('exists', null);
      return true;
    }
    else {
      return false;
    }
  };

  EventVat.prototype.expires = function(key, ttl) {

    var self = this, newVal;
    var op = ttl[0];

    ttl = parseInt(ttl.slice(1), 10);

    if(op === '+') { 
      newVal = this.store[key].ttl += ttl;
    }
    else {
      newVal = this.store[key].ttl -= ttl;
    }

    return newVal;
  };  
  
  EventVat.prototype.expireat = function(key, dueDate) {
    if(this.store[key]) {
      return this.store[key].dueDate = dueDate;
    }
    else {
      return false;
    }
  };

  EventVat.prototype.keys = function(key) {

    if(this.store[key]) {
      var keys = [];

      for(var k in this.store) {
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

  EventVat.prototype.persist = function(key) {
    if(this.store[key] && self.store[key].ttl) {
      this.emit('persist', key);
      this.emit('persist', null);
      return delete this.store[key].ttl;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.randomkey = function() {
    var keys = Object.keys(this.store);
    var index = Math.floor(Math.random()*keys.length);
    return keys[index];
  };
  
  EventVat.prototype.type = function(key) {
    return ({}).toString.call(this.store[key]);
  };
  
  EventVat.prototype.append = function(key, value) {
    if(this.store[key] && typeof this.store[key] === 'string') {
      var newValue = this.store[key].value + value;
      this.emit('append', key, value, newValue);
      this.emit('append', null, value, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };  

  EventVat.prototype.ttl = function(key, ttl) {
    return this.store[key].ttl;
  };

  EventVat.prototype.dump = function(stringify) {
    var dump = stringify ? JSON.stringify(this.store) : this.store;
    this.emit('dump', null, dump);
    return dump;
  };

}((typeof exports === 'undefined') ? window : exports));

