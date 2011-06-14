
/*
 * EventVat.js
 * docs: http://www.github.com/hij1nx/EventVat
*/

;(function(exports) {

  var EventVat = exports.EventVat = function EventVat(data) {

    if (!(this instanceof EventVat)) {
      return new EventVat(data);
    }

    var self = this;

    this.store = data || {};
    
    this._delimiter = '.';
    this._maxListeners = 10;
    this._events = {};

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

  EventVat.prototype.addListener = function(event, key, listener) {

    if(typeof key === 'function') {
      listener = key;
    }
    else {
      event = event + this._delimiter + key;
    }

    var name, ns = this._events;

    // Signal that a new listener is being added.
    this.emit('newListener', event, listener);

    // the name has a delimiter
    if (~event.indexOf(this._delimiter)) {

      //split the name into an array
      name = event.split(this._delimiter);

      // continue to build out additional namespaces and attach the listener to them
      for(var i = 0, l = name.length; i < l; i++) {

        // get the namespace
        ns = ns[name[i]] || (ns[name[i]] = {});
      }
    }

    // if the name does not have a delimiter
    else {

      // get a handle to the event
      ns = ns[event] || (ns[event] = {});
    }

    if (ns._listeners && ns._listeners.length === this.maxListeners) {
      this.emit('maxListeners', event);
      return;
    }
    ns._listeners ? ns._listeners.push(listener) : ns._listeners = [listener];
  };

  EventVat.prototype.on = EventVat.prototype.addListener;

  EventVat.prototype.once = function(event, key, listener) {
    this.many(event, key, listener, 1);
  };

  EventVat.prototype.many = function(event, key, listener, ttl) {

    var self = this;

    this.addListener(event, key, function() {
      if(ttl-- == 0) {
        self.removeListener(event, listener);
      }
      else {
        listener.apply(null, arguments);
      }
    });
  };

  EventVat.prototype.emit = function(event) {

    var self = this, args = arguments, i = 0, j = 0;

    function invokeListeners(val) {
      for (var k = 0, l = val._listeners.length; k < l; k++) {
        val._listeners[k].apply(this, args);
      }
      return true;
    }

    if (~event.indexOf(this._delimiter)) {

      name = event.split(this._delimiter);

      var explore = [this._events],
          invoked = false,
          key = null;

      for (i = 0; i < name.length; i++) {
        var part = name[i],
            newSets = [];

        for (j = 0; j < explore.length; j++) {
          var ns = explore[j];

          if (i === name.length - 1) {
            if (part === '*') {
              for (key in ns) {
                if (ns.hasOwnProperty(key)) {
                  if (ns[key] && ns[key]._listeners) {
                    invokeListeners(ns[key]);
                  }
                }
              }
              invoked = true;
            }
            else {
              if (ns[part] && ns[part]._listeners && invokeListeners(ns[part])) {
                invoked = true;
              }
              else if (ns['*'] && ns['*']._listeners && invokeListeners(ns['*'])) {
                invoked = true;
              }
            }
          }
          else {
            if (part !== '*') {
              if (!ns[part] && !ns['*']) {
                continue;
              }

              if (ns[part]) {
                if (ns['*']) {
                  newSets.push(ns['*']);
                }

                explore[j] = explore[j][part];
              }
              else if (ns['*']) {
                explore[j] = explore[j]['*'];

                if (ns['*'] && ns['*']._listeners && invokeListeners(ns['*'])) {
                  invoked = true;
                }
              }
            }
            else {
              for (key in ns) {
                if (ns.hasOwnProperty(key)) {
                  newSets.push(ns[key]);
                }
              }

              if (ns['*'] && ns['*']._listeners && invokeListeners(ns['*'])) {
                invoked = true;
              }

              explore.splice(j, 1);
            }
          }
        }

        if (newSets.length) {
          explore = explore.concat(newSets);
        }
      }

      return invoked;
    }
    else if (this._events[event] && this._events[event]._listeners) {

      var listeners = this._events[event]._listeners;
      for(i = 0, l = listeners.length; i < l; i++) {
        listeners[i].apply(this, args);
      }
    }
    return true;
  };

  EventVat.prototype.removeListener = function(event, listener) { 
    if(listener && this._events[event]._listeners) {
      for(var i = 0, l = this._events[event]._listeners.length; i < l; i++) {
        if(listener === this._events[event]._listeners[i]) {
          this._events[event]._listeners.slice(i, 1);
        }
      }
    }
    else {
      this._events[event] = {};
    }
  };

  EventVat.prototype.removeAllListeners = function(){ this._events = {}; };

  EventVat.prototype.setMaxListeners = function(n) {
    this.maxListeners = n;
  };

  EventVat.prototype.listeners = function(event) {
    if(this._events[event]) {
      return this._events[event]._listeners;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.get = function(key) {

    var newValue;

    if(this.store[key]) {
      var newValue = this.store[key].value;
      this.emit('get.' + key, newValue);
      this.emit('get', newValue);
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

    this.emit('set.' + key, value);
    this.emit('set', key, value);
    return value;
  };
  
  EventVat.prototype.setnx = function(key, value) {
    if(!this.store[key]) {
      this.store[key] = value;
      this.emit('set.' + key, value);
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
      this.emit('rename.' + oldKey, newKey);
      this.emit('rename', oldKey, newKey);
      return this.store[key].value;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.renamenx = function(oldKey, newKey) {
    if(this.store[oldKey] && typeof this.store[newKey] === 'undefined') {
      this.store[newKey] = this.store[oldKey];
      this.emit('renamenx.' + oldKey, newKey);
      this.emit('renamenx', oldKey, newKey);
      return this.store[key].value;
    }
    else {
      return false;
    }
  };  
  
  EventVat.prototype.decr = function(key, value) {
    if(this.store[key] && typeof this.store[key].value === 'number') {
      var newValue = value ? this.store[newKey].value -= value : this.store[newKey].value--;
      this.emit('decr.' + key, value, newValue);
      this.emit('decr', value, newValue);
      return newValue;
    }
    else {
      return false;
    }
  };
  
  EventVat.prototype.incr = function(key, value) {
    if(this.store[key] && typeof this.store[key].value === 'number') {
      value ? this.store[newKey].value += value : this.store[newKey].value++;
      this.emit('incr.' + key, value);
      this.emit('incr', value);
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

      this.emit('swap.' + a, b, depth);
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
      this.emit('findin.' + key, value, index);
      this.emit('findin', value, index);
      return index;
    }
    else {
      return false;
    }
  };

  EventVat.prototype.del = function(key) {
    if(!this.store[key]) {
      this.emit('del.' + key);
      this.emit('del');
      return delete this.store[key];
    }
    else {
      return false;
    }
  };

  EventVat.prototype.exists = function(key) {
    if(this.store[key]) {
      this.emit('exists.' + key);
      this.emit('exists');
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
      this.emit('persist.' + key);
      this.emit('persist');
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
      this.emit('append.' + key, value, newValue);
      this.emit('append', value, newValue);
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
    
    var dump = {};
    
    for(var key in this.store) {
      if(this.store.hasOwnProperty(key)) {
        dump[key] = this.store[key].value;
      }
    }
    
    dump = stringify ? JSON.stringify(dump) : dump;
    
    this.emit('dump', null, dump);
    return dump;
  };

}((typeof exports === 'undefined') ? window : exports));

