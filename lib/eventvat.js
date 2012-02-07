;(function(module, undefined) {

  var EventEmitter2, EventVat;

  if(!EventEmitter2 && require) {
    EventEmitter2 = require('eventemitter2').EventEmitter2;
    if(!EventEmitter2) {
      throw new Error('`EventEmitter2` is not defined.');
    }
  }

  function init() {
    this._events = new Object;
  }

  this.wildcard = ' ';
  this.listenerTree = new Object;

  //
  // Determine if a key exists within an object
  //
  function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  EventVat = module.exports = function EventVat(conf) {

    if (!(this instanceof EventVat)) {
      return new EventVat(conf);
    }

    this.hash = conf && conf.data || {};
  };

  for (var member in EventEmitter2.prototype) {
    EventVat.prototype[member] = EventEmitter2.prototype[member];
  }

  EventVat.prototype.publish     = EventEmitter2.prototype.emit;
  EventVat.prototype.subscribe   = EventEmitter2.prototype.on;
  EventVat.prototype.unsubscribe = EventEmitter2.prototype.removeListener;

  EventVat.prototype.die = function(key) {
    for (var key in this.hash) {
      if (has(this.hash, key)) {
        if (this.hash[key].tid) {
          clearTimeout(this.hash[key].tid);
        }
      }
    }
  };

  // KEYS
  // ----

  //
  // Delete a key
  //
  EventVat.prototype.del = function(key /* ... */) {
    var n = 0;

    for (var i = 0, l = arguments.length; i < l; i++) {
      key = arguments[i];
      if(has(this.hash, key)) {
        this.persist(key);
        delete this.hash[key];
        this.emit('del ' + key);
        this.emit('del', key);
        n++;
      }
    }

    return n;
  };

  //
  // Determine if a key exists
  //
  EventVat.prototype.exists = function(key) {
    var exists = has(this.hash, key);
    this.emit('exists ' + key, exists);
    this.emit('exists', key, exists);
    return exists;
  };

  //
  // Set a key's time to live in seconds
  //
  EventVat.prototype.expire = function(key, ttl) {

    if (has(this.hash, key) && typeof ttl === 'number' && ttl > -1) {
      if (this.hash[key].tid) {
        clearTimeout(this.hash[key].tid);
      }

      var ms = ttl * 1000;
      var that = this;
      that.hash[key].tid = setTimeout(function() {
        that.del(key);
      }, ms);
      that.hash[key].tend = +new Date() + ms;

      this.emit('expire ' + key, ttl);
      this.emit('expire', key, ttl);
      return true;

    }
    else {
      return false;
    }
  };

  //
  // Set the expiration for a key as a UNIX timestamp
  //
  EventVat.prototype.expireat = function(key, dueDate) {
    var ttl = dueDate - (Math.round(new Date() / 1000));
    var rs = this.expire(key, ttl);

    if (rs) {
      this.emit('expireat ' + key, dueDate);
      this.emit('expireat', key, dueDate);
    }

    return rs;
  };

  //
  // Find all keys matching the given pattern
  //
  EventVat.prototype.keys = function(regex) {
    var keys = [];

    for(var k in this.hash) {
      if(has(this.hash, k) && regex.test(k)) {
        keys.push(k);
      }
    }

    this.emit('keys', keys, regex);
    return keys;
  };

  //
  // Move a key to another database
  //
  EventVat.prototype.move = function(key, db) {
    if(db && db.hash) {
      this.persist(key);
      db.hash[key] = this.hash[key];
      delete this.hash[key];
      this.emit('move ' + key, db);
      this.emit('move', key, db);
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
    if(has(this.hash, key) && this.hash[key].tid) {
      clearTimeout(this.hash[key].tid);
      delete this.hash[key].tid;
      delete this.hash[key].tend;
      this.emit('persist ' + key);
      this.emit('persist', key);
      return true;
    }
    else {
      return false;
    }
  };

  //
  // Return a random key from the keyspace
  //
  EventVat.prototype.randomkey = function() {
    var keys = this.keys(/^/);
    var index = Math.floor(Math.random()*keys.length);
    var key = keys[index] || null;
    this.emit('randomkey', key);
    return key;
  };

  //
  // Rename a key
  //
  EventVat.prototype.rename = function(oldKey, newKey) {
    if(has(this.hash, oldKey)) {
      this.persist(oldKey);
      this.persist(newKey);
      this.hash[newKey] = this.hash[oldKey];
      delete this.hash[oldKey];
      this.emit('rename ' + oldKey, newKey);
      this.emit('rename', oldKey, newKey);
      return true;
    }
    else {
      return false;
    }
  };

  //
  // Rename a key, only if the new key does not exist
  //
  EventVat.prototype.renamenx = function(oldKey, newKey) {
    if(has(this.hash, oldKey) && !has(this.hash, newKey)) {
      this.persist(oldKey);
      this.hash[newKey] = this.hash[oldKey];
      this.emit('renamenx ' + oldKey, newKey);
      this.emit('renamenx', oldKey, newKey);
      return true;
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
    if (has(this.hash, key)) {
      var value = this.hash[key].value;
      var type = typeof value;

      if (type === 'object') {
        return this.hash[key].type
          || (Object.prototype.toString.call(value) === '[object Array]'
              ? 'list' : 'hash');
      } else {
        return type;
      }
    } else {
      return 'none';
    }
  };

  //
  // Get the time to live for a key
  //
  EventVat.prototype.ttl = function(key) {
    var ttl = has(this.hash, key) && this.hash[key].tid
      ? Math.round((this.hash[key].tend - new Date()) / 1000)
      : -1;

    this.emit('ttl ' + key, ttl);
    this.emit('ttl', key, ttl);
    return ttl;
  };

  // STRINGS
  // -------

  //
  // Append a value to a key
  //
  EventVat.prototype.append = function(key, value) {
    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: '' };
    } else if (type !== 'string') {
      return 0;
    } else {
      this.persist(key);
    }

    var newValue = this.hash[key].value += value;
    this.emit('append ' + key, value, newValue);
    this.emit('append', key, value, newValue);
    return newValue.length;
  };

  //
  // Decrement the integer value of a key by one
  //
  EventVat.prototype.decr = function(key) {
    var value = this.decrby(key, 1);
    if (value !== false) {
      this.emit('decr ' + key, value);
      this.emit('decr', key, value);
    }
    return value;
  };

  //
  // Decrement the integer value of a key by N
  //
  EventVat.prototype.decrby = function(key, value) {
    if (!has(this.hash, key)) {
      this.hash[key] = { value: 0 };
    } else if (this.type(key) !== 'number') {
      return false;
    }

    this.persist(key);
    var newValue = value ? this.hash[key].value -= value : this.hash[key].value--;
    this.emit('decrby ' + key, value, newValue);
    this.emit('decrby', key, value, newValue);
    return newValue;
  };

  //
  // Get the value of a key
  //
  EventVat.prototype.get = function(key) {

    var newValue;

    if(has(this.hash, key)) {
      var newValue = this.hash[key].value;
      this.emit('get ' + key, newValue);
      this.emit('get', key, newValue);
      return newValue;
    }
    else {
      return null;
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
    if (this.type(key) === 'string') {
      var value = this.hash[key].value.slice(start, end);
      this.emit('getrange ' + key, value);
      this.emit('getrange', key, value);
      return value;
    } else {
      return false;
    }
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
  EventVat.prototype.incr = function(key) {
    var value = this.incrby(key, 1);
    if (value !== false) {
      this.emit('incr ' + key, value);
      this.emit('incr', key, value);
    }
    return value;
  };

  //
  // Increment the integer value of a key by the given number
  //
  EventVat.prototype.incrby = function(key, value) {
    value = +value;

    if (!has(this.hash, key)) {
      this.hash[key] = { value: 0 };
    } else if (this.type(key) !== 'number') {
      return false;
    }

    this.persist(key);
    var newValue = this.hash[key].value += value;
    this.emit('incrby ' + key, value, newValue);
    this.emit('incrby', key, value, newValue);
    return newValue;
  };

  //
  // Get the values of all the given keys
  //
  EventVat.prototype.mget = function(key /* ... */) {
    var values = [];
    for(var i=0, l=arguments.length; i < l; i++) {
      values.push(this.get(arguments[i]));
    }
    this.emit('mget', values);
    return values;
  };

  //
  // Set multiple keys to multiple values
  //
  EventVat.prototype.mset = function(keys /* ... */, values /* ... */) {
    var key, value;

    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];
      
      if (has(this.hash, key)) {
        this.persist(key);
        delete this.hash[key].type;
        this.hash[key].value = value;
      } else {
        this.hash[key] = { value: value };
      }
    }

    // set events must be emitted after keys are updated
    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];
      
      this.emit('set ' + key, value);
      this.emit('set', key, value);
    }

    var args = Array.prototype.slice.call(arguments)
    args.unshift('mset');
    this.emit.apply(this, args);
    return true;
  };

  //
  // Set multiple keys to multiple values, only if none of the keys exist
  //
  EventVat.prototype.msetnx = function(keys /* ... */, values /* ... */) {
    var key, value;

    for(var i=0, l=arguments.length; i < l; i += 2) {
      if (has(this.hash, arguments[i])) {
        return false;
      }
    }
      
    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];

      if (!has(this.hash, key)) {
        this.hash[key] = { value: value };
      }
    }

    for(var i=0, l=arguments.length; i < l; i += 2) {
      key = arguments[i];
      value = arguments[i + 1];
      
      this.emit('set ' + key, value);
      this.emit('set', key, value);
      this.emit('setnx ' + key, value);
      this.emit('setnx', key, value);
    }

    var args = Array.prototype.slice.call(arguments)
    args.unshift('msetnx');
    this.emit.apply(this, args);
    return true;
  };

  //
  // Set the string value of a key
  //
  EventVat.prototype.set = function(key, value, ttl) {
    var that = this;
    
    if(has(this.hash, key)) {
      delete this.hash[key].type;
      this.hash[key].value = value;
    }
    else {
      this.hash[key] = { value: value };
    }

    this.persist(key);
    this.expire(key, ttl);
    this.emit('set ' + key, value);
    this.emit('set', key, value);
    return true;
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
  // Set the value of a key, only if the key does not exist
  //
  EventVat.prototype.setnx = function(key, value, ttl) {
    if(!has(this.hash, key)) {
      this.set(key, value, ttl);
      this.emit('setnx ' + key, value);
      this.emit('setnx', key, value);
      return true;
    }
    else {
      return false;
    }
  };

  //
  // Set the value of a string within the given range
  //
  EventVat.prototype.setrange = function(key, offset, value) {
    if (this.type(key) === 'string') {
      var p1 = this.hash[key].value.slice(0, offset);
      var p2 = this.hash[key].value.slice(offset + value.length);
      var newValue = p1 + value + p2;
      var l = newValue.length;

      this.persist(key);
      this.hash.value = newValue;

      this.emit('setrange ' + key, newValue);
      this.emit('setrange', key, newValue);
      return l;
    } else {
      return false;
    }
  };

  //
  // Get the length of the value stored in a key
  //
  EventVat.prototype.strlen = function(key) {
    if(this.type(key) === 'string') {
      var l = this.hash[key].value.length;
      this.emit('strlen ' + key, l);
      this.emit('strlen', key, l);
      return l;
    }
    return 0;
  };

  //
  // HASHES
  // ------
  //

  //
  // delete one or more hash fields
  //
  EventVat.prototype.hdel = function(key, field /* ... */) {
    var n = 0;

    if (this.type(key) === 'hash') {
      this.persist(key);

      for (var i=1, l = arguments.length; i < l; i++) {
        field = arguments[i];
        if (has(this.hash[key].value, field)) {
          delete this.hash[key].value[field];
          this.emit('hdel ' + key, field);
          this.emit('hdel', key, field);
          n++;
        }
      }
    }

    return n;
  };

  //
  // determine if a hash field exists
  //
  EventVat.prototype.hexists = function(key, field) {
    var e = this.type(key) === 'hash' && has(this.hash[key].value, field);
    this.emit('hexists ' + key, field, e);
    this.emit('hexists', key, field, e);
    return e;
  };

  //
  // get the value of a hash field.
  //
  EventVat.prototype.hget = function(key, field) {
    if(this.type(key) === 'hash' && has(this.hash[key].value, field)) {
      var value = this.hash[key].value[field];
      this.emit('hget ' + key, field, value);
      this.emit('hget', key, field, value);
      return value;
    }
    else {
      return null;
    }
  };

  //
  // get all the fields and values in a hash
  //
  EventVat.prototype.hgetall = function(key) {
    var hash = this.type(key) === 'hash' ? this.hash[key].value : {};
    this.emit('hgetall ' + key, hash);
    this.emit('hgetall', key, hash);
    return hash;
  };

  //
  // increment the integer value of a hash field by 1
  //
  EventVat.prototype.hincr = function(key, field) {
    var value = this.hincrby(key, field, 1);
    if (value !== false) {
      this.emit('hincr ' + key, field, value);
      this.emit('hincr', key, field, value);
    }
    return value;
  };

  //
  // increment the integer value of a hash field by the given number
  //
  EventVat.prototype.hincrby = function(key, field, value) {
    value = +value;

    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    } else if (type !== 'hash') {
      return false;
    }

    if (!has(this.hash[key].value, field)) {
      this.hash[key].value[field] = 0;
    } else if (typeof this.hash[key].value[field] !== 'number') {
      return false;
    }

    var newValue = this.hash[key].value[field] += value;
    this.emit('hincrby ' + key, field, value, newValue);
    this.emit('hincrby', key, field, value, newValue);
    return newValue;
  };

  //
  // decrement the integer value of a hash field by 1
  //
  EventVat.prototype.hdecr = function(key, field) {
    var value = this.hdecrby(key, field, 1);
    if (value !== false) {
      this.emit('hdecr ' + key, field, value);
      this.emit('hdecr', key, field, value);
    }
    return value;
  };

  //
  // decrement the integer value of a hash field by the given number
  //
  EventVat.prototype.hdecrby = function(key, field, value) {
    value = +value;

    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    } else if (type !== 'hash') {
      return false;
    } else {
      this.persist(key);
    }

    if (!has(this.hash[key].value, field)) {
      this.hash[key].value[field] = 0;
    } else if (typeof this.hash[key].value[field] !== 'number') {
      return false;
    }

    var newValue = this.hash[key].value[field] -= value;
    this.emit('hdecrby ' + key, field, value, newValue);
    this.emit('hdecrby', key, field, value, newValue);
    return newValue;
  };

  //
  // get all the fields in a hash
  //
  EventVat.prototype.hkeys = function(key) {
    var fields = [];

    if (this.type(key) === 'hash') {
      var hash = this.hash[key].value;
      for (var k in hash) {
        if (has(hash, k)) {
          fields.push(k);
        }
      }
    }

    this.emit('hkeys ' + key, fields);
    this.emit('hkeys', key, fields);
    return fields;
  };

  //
  // get the number of fields in a hash
  //
  EventVat.prototype.hlen = function(key) {
    var len = 0;

    if (this.type(key) === 'hash') {
      var hash = this.hash[key].value;
      for (var k in hash) {
        if (has(hash, k)) {
          len++;
        }
      }
    }

    this.emit('hlen ' + key, len);
    this.emit('hlen', key, len);
    return len;
  };

  //
  // get the values of all the given hash fields
  //
  EventVat.prototype.hmget = function(key, field /* ... */) {
    var values = [];

    for(var i=1, l=arguments.length; i < l; i++) {
      values.push(this.hget(key, arguments[i]));
    }

    this.emit('hmget ' + key, values);
    this.emit('hmget', key, values);
    return values;
  };

  //
  // set multiple hash fields to multiple values
  //
  EventVat.prototype.hmset = function(key, fields /* ... */, values /* ... */) {
    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    } else if (type !== 'hash') {
      return false;
    } else {
      this.persist(key);
    }

    for(var i=1, l=arguments.length; i < l; i += 2) {
      this.hash[key].value[arguments[i]] = arguments[i + 1];
    }

    // set events must be emitted after keys are updated
    var field, value;
    for(var i=1, l=arguments.length; i < l; i += 2) {
      field = arguments[i];
      value = arguments[i + 1];
      
      this.emit('hset ' + key, field, value);
      this.emit('hset', key, field, value);
    }

    var args = Array.prototype.slice.call(arguments)
    this.emit.apply(this, ['hmset ' + key].concat(args.slice(1)));
    this.emit.apply(this, ['hmset'].concat(args));
    return true;
  };

  //
  // set the string value of a hash field
  //
  EventVat.prototype.hset = function(key, field, value) {
    var update;
    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
      update = false;
    } else if (type === 'hash') {
      this.persist(key);
      update = has(this.hash[key].value, field);
    } else {
      return false;
    }

    this.hash[key].value[field] = value;
    this.emit('hset ' + key, field, value);
    this.emit('hset', key, field, value);

    return update;
  };

  //
  // Set the value of a hash field, only if the field does not exist
  //
  EventVat.prototype.hsetnx = function(key, field, value /* ... */) {
    var type = this.type(key);
    if (type === 'none') {
      this.hash[key] = { value: {}, type: 'hash' };
    } else if (type !== 'hash') {
      return false;
    } else {
      this.persist(key);
    }

    if (!has(this.hash[key].value, field)) {
      this.hset(key, field, value);
      this.emit('hsetnx ' + key, field, value);
      this.emit('hsetnx', key, field, value);
      return true;
    } else {
      return false;
    }
  };

  //
  // get all the values in a hash
  //
  EventVat.prototype.hvals = function(key) {
    var values = [];

    if (this.type(key) === 'hash') {
      var hash = this.hash[key].value;
      for (var k in hash) {
        if (has(hash, k)) {
          values.push(hash[k]);
        }
      }
    }

    this.emit('hvals ' + key, values);
    this.emit('hvals', key, values);
    return values;
  };

  //
  // LISTS
  // -----
  //

  //
  // Get an element from a list by its index
  //
  EventVat.prototype.lindex = function(key, index) {
    if (this.type(key) === 'list') {
      var list = this.hash[key].value;
      var len = list.length;

      if (index < 0) {
        index = len + index;
      }
      if (index < 0 || index >= len) {
        return null;
      }

      var value = list[index];
      this.emit('lindex ' + key, index, value);
      this.emit('lindex', key, index, value);
      return value;
    } else {
      return false;
    }
  };

  //
  // Insert an element before or after another element in a list
  //
  EventVat.prototype.linsert = function(key, ba, pivot, value) {
    throw new Error('Not implemented.');
  };

  //
  // Get the length of a list
  //
  EventVat.prototype.llen = function(key) {
    var type = this.type(key);
    if (type === 'none') {
      return false;
    }

    var len = type === 'list' ? this.hash[key].value.length : 0;
    this.emit('llen ' + key, len);
    this.emit('llen', key, len);
    return len;
  };

  //
  // Remove and get the first element in a list
  //
  EventVat.prototype.lpop = function(key) {
    if (this.type(key) === 'list') {
      this.persist(key);
      var value = this.hash[key].value.shift() || null;
      this.emit('lpop ' + key, value);
      this.emit('lpop', key, value);
      return value;
    } else {
      return null;
    }
  };

  //
  // Prepend one or multiple values to a list
  //
  EventVat.prototype.lpush = function(key, value /* ... */) {
    var type = this.type(key);
    var list;
    if (type === 'none') {
      list = [];
      this.hash[key] = { value: list, type: 'list' };
    } else if (type !== 'list') {
      return false;
    } else {
      this.persist(key);
      list = this.hash[key].value;
    }

    for (var i = 1, l = arguments.length; i < l; i++) {
      var val = arguments[i];
      list.unshift(val);
      this.emit('lpush ' + key, val);
      this.emit('lpush', key, val);
    }

    return list.length;
  };

  //
  // Prepend a value to a list, only if the list exists
  //
  EventVat.prototype.lpushx = function(key, value) {
    if (this.type(key) === 'list') {
      var len = this.hash[key].value.unshift(value);
      this.emit('lpushx ' + key, value);
      this.emit('lpushx', key, value);
      return len;
    } else {
      return 0;
    }
  };

  //
  // Get a range of elements from a list
  //
  EventVat.prototype.lrange = function(key, start, stop) {
    var range = this.type(key) === 'list'
      ? this.hash[key].value.slice(start, stop) : []

    this.emit('lrange ' + key, start, stop, range);
    this.emit('lrange', key, start, stop, range);
    return range;
  };

  //
  // Remove elements from a list
  //
  EventVat.prototype.lrem = function(key, count, value) {
    if (this.type(key) === 'list') {
      this.persist(key);
      var list = this.hash[key].value;
      var n = 0;

      var i, check, incr, cancel, ncount = count;
      // if count is positive, list will be traversed from 0 to list.length
      if (ncount >= 0) {
        i = 0;
        check = function() { return i < list.length };
        incr = function() { i++; };
        cancel = function() { i--; };

        // if count is 0, there is no limit on the number of items
        // that match value to remove
        if (ncount === 0) {
          ncount = Infinity;
        }

      // if count is negative, list will be traversed backwards
      } else {
        i = list.length;
        check = function() { return i >= 0; };
        incr = function() { i--;};
        cancel = function() {};
        ncount *= -1;
      }

      for (; check(); incr()) {
        if (list[i] === value) {
          list.splice(i, 1);
          cancel();
          if (++n === ncount) {
            break;
          }
        }
      } 

      this.emit('lrem ' + key, count, value, n);
      this.emit('lrem', key, count, value, n);
      return n;
    } else {
      return 0;
    }
  };

  //
  // Set the value of an element in a list by its index
  //
  EventVat.prototype.lset = function(key, index, value) {
    if (this.type(key) === 'list') {
      this.persist(key);
      var list = this.hash[key].value;
      var len = list.length;

      if (index < 0) {
        index = len + index;
      }
      if (index < 0 || index >= len) {
        return false;
      }

      list[index] = value;
      this.emit('lset ' + key, index, value);
      this.emit('lset', key, index, value);
      return true;
    } else {
      return false;
    }
  };

  //
  // Trim a list to the specified range
  //
  EventVat.prototype.ltrim = function(key, start, stop) {
    if (this.type(key) === 'list') {
      this.persist(key);
      this.hash[key].value = this.hash[key].value.slice(start, stop);
      this.emit('ltrim ' + key, start, stop);
      this.emit('ltrim', key, start, stop);
      return true;
    } else {
      return false;
    }
  };

  //
  // Remove and get the last element in a list
  //
  EventVat.prototype.rpop = function(key) {
    if (this.type(key) === 'list') {
      this.persist(key);
      var value = this.hash[key].value.pop() || null;
      this.emit('rpop ' + key, value);
      this.emit('rpop', key, value);
      return value;
    } else {
      return null;
    }
  };

  //
  // Remove the last element in a list, append it to another list and return it
  //
  EventVat.prototype.rpoplpush = function(source, destination) {
    if (this.type(source) === 'list') {
      var dtype = this.type(destination);
      var dest;

      if (dtype === 'none') {
        dest = [];
        this.hash[destination] = { value: dest, type: 'list' };
      } else if (dtype !== 'list') {
        return null;
      } else {
        this.persist(destination);
        dest = this.hash[destination].value;
      }

      this.persist(source);
      var value = this.hash[source].value.pop();
      dest.unshift(value);
      this.emit('rpoplpush ' + source, destination, value);
      this.emit('rpoplpush', source, destination, value);
      this.emit('rpop ' + source, value);
      this.emit('rpop', source, value);
      this.emit('lpush ' + destination, value);
      this.emit('lpush', destination, value);
      return value;
    } else {
      return null;
    }
  };

  //
  // Append one or multiple values to a list
  //
  EventVat.prototype.rpush = function(key, value /* ... */ ) {
    var type = this.type(key);
    var list;
    if (type === 'none') {
      list = [];
      this.hash[key] = { value: list, type: 'list' };
    } else if (type !== 'list') {
      return false;
    } else {
      this.persist(key);
      list = this.hash[key].value;
    }

    for (var i = 1, l = arguments.length; i < l; i++) {
      var val = arguments[i];
      list.push(val);
      this.emit('rpush ' + key, val);
      this.emit('rpush', key, val);
    }

    return list.length;
  };

  //
  // Append a value to a list, only if the list exists
  //
  EventVat.prototype.rpushx = function(key, value) {
    if (this.type(key) === 'list') {
      var len = this.hash[key].value.push(value);
      this.emit('rpushx ' + key, value);
      this.emit('rpushx', key, value);
      return len;
    } else {
      return 0;
    }
  };

  //
  //
  // Non stsandard methods.
  //
  //
  EventVat.prototype.dump = function(stringify) {
    
    var dump = {};
    
    for(var key in this.hash) {
      if(has(this.hash, key)) {
        dump[key] = this.hash[key].value;
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
    if(has(this.hash, a) && has(this.hash, b)) {
      
      var av = this.hash[a]; 
      var bv = this.hash[b];
      
      if(depth) {
        av = this.hash[a] = [bv, bv = this.hash[b] = av][0];
      }
      else {
        av.value = [bv.value, bv.value = av.value][0];
      }

      this.persist(a);
      this.persist(b);
      this.emit('swap ' + a, b, depth);
      this.emit('swap ' + b, a, depth);
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
    if(has(this.hash, key)) {
      var index = this.hash[key].value.indexOf(value)
      this.emit('findin ' + key, value, index);
      this.emit('findin', key, value, index);
      return index;
    }
    else {
      return false;
    }
  };

  //
  // set the current revision
  //

}((typeof process !== 'undefined' && process.title) ? module : window));

