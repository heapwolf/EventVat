![Alt text](https://github.com/hij1nx/EventVat/raw/master/logo.png)

# Synopsis

EventVat is event based. A **Vat** is a large tank or tub used to hold liquid. Because of the type of data EventVat deals with, it's contents could be considered liquid like.

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
  var m = EventVat(data); // create a new EventVat object with a existing key/value pairs, returns new instance.
```

### Instance methods
#### get(key)
Get the value of the `key`, returns the value retrieved.

```javascript
  m.get('foo'); 
```

#### set(key [, value, ttl])
Set the value of `key` to `value`, returns boolean value to represent the success of the operation. If no value is assigned, the key's value will be emptied. if a time to live is specified, the key will be deleted after N milliseconds.

```javascript
  m.set('foo', 'bar');
```

#### setnx(key, value)
Set a value on a key, but only do so if one does not exist. If the `key` already exists, return false.

```javascript
  m.setnx('key', 'value'); // create 'key' and assign it nothing, returns false upon finding existing key.
```

#### ttl(key [, value])
Find the TTL (time to live) value, or assign one to a key.

```javascript
  m.ttl('key'); // reutns the time to live.
  m.ttl('key', '+1000'); // add time.
  m.ttl('key', '-1000'); // subtract time.
```


m.ren('key', 'key'); // rename a key, preserve the date/timestamp, returns success bool.

m.decr('key'); // if the value is numeric, decrement it.
m.incr('key'); // if the value is numeric, increment it.

m.swap('key', 'key'); // swap the value of one key with another.
m.findin('key', 'value'); // same as indexOf in a string.
m.replace('key', '')

m.del('key'); // delete the 'key' key, returns success bool.

m.created('key'); // returns the date/time the 'key' key was created.

m.exists('key', function(key, value) { // an event handler registered to the 'key' key if it exists.
  console.log(key, value);
});

m.exists('key', 1000, function(key, value) { // an event handler registered to the 'key' key if it exists after Time.
  console.log(key, value);
});

m.on('del', 'key', function(key, value) { // an event handler registered to the 'del' event for the 'key' key.
  console.log(key, value);
});


m.dump(true); // get everything and dump it, accepts bool for JSON.stringify





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

