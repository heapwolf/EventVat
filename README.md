![Alt text](https://github.com/hij1nx/EventVat/raw/master/logo.png)

# Synopsis

A **Vat** is a large tank or tub used to hold liquid. Because of the type of data EventVat deals with, it's contents could be considered liquid like.

EventVat is a in-process key/value store with an API inspired by Redis. It supports 5 data types, `strings`, `numbers`, `booleans`, `arrays` and `hashes`. It's evented, which means that when API calls are made, events will be raised for which a callback can be provided. EventVat is great for working with volatile (short time to live) data in Node.js and the browser.

# Motivation

 - Reduce trips across the process boundary.
 - Portability, works in the browser and on the server.
 - Event based key/value storage and retrieval.
 - A single API for many data storage end-points (such as local browser storage, a local filesystem or couchdb).

# Usage

Instantiate EventVat with existing data or without. Methods and events are hung off of the new instance. Each method that can act on the instance will raise an event by the same name. 

## events
EventVat uses a slightly tweaked version of the Node.js event Emitter. A EventVat event has three characteristics, a name, an optional key and a callback.

### Activity based events.

```javascript
  var m = new EventVat;

  m.on('get', function(key, value) {
    console.log('getting: ',key, value);
  });

  m.set('foo', 'bar');

  m.get('foo');
```

### Activity/Key based events.

```javascript
  var m = new EventVat;

  m.on('get', 'foo', function(key, value) {
    console.log('getting: ',key, value);
  });

  m.on('set', 'foo', function(key, value) {
    console.log('setting: ', key, value);
  });    

  m.set('foo', 'bar');

  m.get('foo');
```

# API

### Constructor
#### EventVat(data)

```javascript
  var demo = EventVat(data); // create a new EventVat object with a existing key/value pairs, returns new instance.
```

### Instance methods
#### get(key)
Get the value of the `key`, returns the value retrieved.

```javascript
  demo.get('foo'); 
```

#### set(key [, value, ttl])
Set the value of `key` to `value`, returns boolean value to represent the success of the operation. If no value is assigned, the key's value will be emptied. if a time to live is specified, the key will be deleted after N milliseconds.

```javascript
  demo.set('foo', 'bar');
```

#### setnx(key, value)
Set a value on a key, but only do so if one does not exist. If the `key` already exists, return false.

```javascript
  demo.setnx('key', 'value'); // create 'key' and assign it nothing, returns false upon finding existing key.
```

#### ttl(key [, value])
Find the TTL (time to live) value, or assign one to a key.

```javascript
  demo.ttl('key'); // reutns the time to live.
  demo.ttl('key', '+1000'); // add time.
  demo.ttl('key', '-1000'); // subtract time.
```

#### ren(a, b, reset)
Rename a key from `a` to `b`. Will preserve the date/timestamp unless the boolean value `reset` is provided. Returns boolean value to represent the success of the operation.

```javascript
  demo.ren('key', 'key');
```

#### decr(key)
If the value of `key` is numeric, decrement it and return the new value.

```javascript
  demo.decr('key');
```

#### incr(key)
If the value of `key` is numeric, increment it and return the new value.

```javascript
  demo.incr('key'); // if the value is numeric, increment it.
```

#### swap(a, b, depth)
Swap the value of `a` with `b`, if the boolean value `depth` is provided, the `created`, `modified`, `value` and `ttl` values will be 


  demo.swap('key', 'key');

demo.findin('key', 'value'); // same as indexOf in a string.
demo.replace('key', '')

demo.del('key'); // delete the 'key' key, returns success bool.

demo.created('key'); // returns the date/time the 'key' key was created.

demo.exists('key', function(key, value) { // an event handler registered to the 'key' key if it exists.
  console.log(key, value);
});

demo.exists('key', 1000, function(key, value) { // an event handler registered to the 'key' key if it exists after Time.
  console.log(key, value);
});

demo.on('del', 'key', function(key, value) { // an event handler registered to the 'del' event for the 'key' key.
  console.log(key, value);
});


demo.dump(true); // get everything and dump it, accepts bool for JSON.stringify





### Static Methods

#### random()
Generates a random key and assigns it 'value', returns the new key.

```javascript
  m.set(m.random(), 'value');
```

#### save()
Attempts to save a string to a either the local browser storage or a file stream.

```javascript
  m.save(m.dump(true)); // attempt dump to local storage
```

